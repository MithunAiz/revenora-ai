import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import {
  AnalyticsSummary,
  AIReviewResult,
  ClaimActivityEntry,
  ClaimRecord,
  DemoModeState,
  HospitalMetrics,
  NotificationItem,
  ValidationIssue,
  ValidationMetric,
} from '../types';
import {
  analyticsSummary as analyticsSummarySeed,
  claims as claimsSeed,
  demoModeState as demoModeSeed,
  metrics as metricsSeed,
  notifications as notificationsSeed,
  validationPipeline,
  validationIssues as validationIssuesSeed,
} from '../constants/mockData';
import { fetchClaimsFromBackend, submitClaimApi, resubmitClaimApi } from '../services/claimsApi';

type ClaimScenario = 'missingDocumentation' | 'duplicateBilling' | 'codingMismatch' | 'coverageIssue' | 'perfect';

interface DemoClaimBlueprint {
  scenario: ClaimScenario;
  patient: string;
  patientId: string;
  age: number;
  gender: ClaimRecord['gender'];
  diagnosis: string;
  insurance: string;
  assignedStaff: string;
  priority: ClaimRecord['priority'];
  department: string;
  amount: number;
  riskScore: number;
  claimHealth: number;
  status: ClaimRecord['status'];
  stage: ClaimRecord['stage'];
}

interface HospitalWorkflowContextValue {
  claims: ClaimRecord[];
  notifications: NotificationItem[];
  metrics: HospitalMetrics;
  analyticsSummary: AnalyticsSummary;
  demoMode: DemoModeState;
  validationIssues: ValidationIssue[];
  validationPipeline: string[];
  getClaimById: (claimId: string) => ClaimRecord | undefined;
  updateClaim: (claimId: string, updater: (claim: ClaimRecord) => ClaimRecord) => void;
  runAiReview: (claimId: string) => void;
  applyExternalAiReview: (claimId: string, review: AIReviewResult) => void;
  applySuggestion: (claimId: string, issueTitle: string) => void;
  ignoreSuggestion: (claimId: string, issueTitle: string) => void;
  manualEdit: (claimId: string, field: 'status' | 'claimHealth' | 'denialRisk' | 'submissionStatus', value: string | number) => void;
  markReadyForSubmission: (claimId: string) => void;
  submitClaim: (claimId: string) => void;
  toggleDemoMode: (enabled?: boolean) => void;
  setDemoSpeed: (speed: DemoModeState['speed']) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  generateNewBatch: () => void;
  resetDemo: () => void;
  replayLastWorkflow: () => void;
  jumpToHighRiskClaim: () => ClaimRecord | undefined;
  generateScenario: (scenario: ClaimScenario) => ClaimRecord;
  activityFeed: ClaimActivityEntry[];
}

const HospitalWorkflowContext = createContext<HospitalWorkflowContextValue | null>(null);

const cloneClaims = (source: ClaimRecord[]) => source.map((claim) => ({
  ...claim,
  documents: claim.documents.map((document) => ({ ...document })),
  coding: { ...claim.coding, icdCodes: [...claim.coding.icdCodes], procedureCodes: [...claim.coding.procedureCodes], modifiers: [...claim.coding.modifiers] },
  billing: { ...claim.billing },
  aiReview: {
    ...claim.aiReview,
    coverageValidation: { ...claim.aiReview.coverageValidation },
    duplicateBillingCheck: { ...claim.aiReview.duplicateBillingCheck },
    completenessCheck: { ...claim.aiReview.completenessCheck },
    issues: claim.aiReview.issues.map((issue) => ({ ...issue })),
    recommendations: [...claim.aiReview.recommendations],
  },
  timeline: claim.timeline.map((entry) => ({ ...entry })),
  activity: claim.activity.map((entry) => ({ ...entry })),
}));

const timeStamp = () =>
  new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const scenarioForClaim = (claim: ClaimRecord): ClaimScenario => {
  if (claim.status === 'Rejected') return claim.coding.procedureCodes.includes('72148') ? 'codingMismatch' : 'missingDocumentation';
  if (claim.denialRisk >= 70) return 'coverageIssue';
  if (claim.claimHealth >= 90) return 'perfect';
  return claim.aiReview.issues[0]?.title.includes('duplicate') ? 'duplicateBilling' : 'missingDocumentation';
};

const buildMetricSummary = (claims: ClaimRecord[]): HospitalMetrics => {
  const todaysClaims = claims.length;
  const pendingValidation = claims.filter((claim) => claim.status === 'Pending Validation' || claim.status === 'Needs Review').length;
  const approvedClaims = claims.filter((claim) => claim.status === 'Approved' || claim.status === 'Paid').length;
  const rejectedClaims = claims.filter((claim) => claim.status === 'Rejected').length;
  const averageClaimHealth = Math.round(claims.reduce((sum, claim) => sum + claim.claimHealth, 0) / claims.length);
  const averageDenialRisk = Math.round(claims.reduce((sum, claim) => sum + claim.denialRisk, 0) / claims.length);
  const claimsSaved = claims.filter((claim) => claim.claimHealth >= 85).length;
  const revenueProtected = claims.reduce((sum, claim) => sum + (claim.claimHealth >= 80 ? claim.amount : Math.round(claim.amount * 0.35)), 0);

  return {
    ...metricsSeed,
    todaysClaims,
    pendingValidation,
    approvedClaims,
    rejectedClaims,
    averageClaimHealth,
    averageDenialRisk,
    claimsSaved,
    revenueProtected,
  };
};

const buildAnalytics = (claims: ClaimRecord[], metrics: HospitalMetrics): AnalyticsSummary => {
  const highRisk = claims.filter((claim) => claim.denialRisk >= 60).length;
  return {
    ...analyticsSummarySeed,
    approvalRate: Math.round((metrics.approvedClaims / claims.length) * 1000) / 10,
    validationSuccessRate: Math.round(((claims.length - highRisk) / claims.length) * 1000) / 10,
    aiDetectionAccuracy: Math.min(99.2, Math.round((metrics.averageClaimHealth + 7.5) * 10) / 10),
  };
};

const buildNotifications = (claims: ClaimRecord[], message: string, tone: NotificationItem['tone'] = 'info'): NotificationItem[] => [
  { title: 'System update', message, timestamp: timeStamp(), tone },
  ...notificationsSeed,
  { title: 'Queue refreshed', message: `${claims.length} active claims are synchronized across the dashboard.`, timestamp: timeStamp(), tone: 'success' },
];

const addActivity = (claim: ClaimRecord, actor: string, action: string, detail: string): ClaimRecord => ({
  ...claim,
  activity: [
    { timestamp: timeStamp(), actor, action, detail },
    ...claim.activity,
  ].slice(0, 8),
});

const updateTimeline = (claim: ClaimRecord, stage: string): ClaimRecord => {
  if (claim.timeline.some((entry) => entry.stage === stage)) {
    return claim;
  }

  return {
    ...claim,
    timeline: [...claim.timeline, { stage: stage as ClaimRecord['timeline'][number]['stage'], timestamp: timeStamp() }],
    currentStage: stage as ClaimRecord['currentStage'],
  };
};

const nextStageFor = (claim: ClaimRecord): ClaimRecord['currentStage'] => {
  const stageIndex = validationPipeline.indexOf(claim.currentStage);
  if (stageIndex < 0 || stageIndex >= validationPipeline.length - 1) {
    return claim.currentStage;
  }

  return validationPipeline[stageIndex + 1] as ClaimRecord['currentStage'];
};

const stageTone = (stage: string): NotificationItem['tone'] => {
  if (stage.includes('Rejected') || stage.includes('Warning') || stage.includes('Issue')) return 'critical';
  if (stage.includes('Ready') || stage.includes('Approved') || stage.includes('Paid')) return 'success';
  return 'info';
};

const demoClaimBlueprints: DemoClaimBlueprint[] = [
  { scenario: 'missingDocumentation', patient: 'Lena Ortiz', patientId: 'PT-2081', age: 44, gender: 'Female', diagnosis: 'Outpatient abdominal pain workup', insurance: 'Aetna', assignedStaff: 'Maya Patel', priority: 'High', department: 'Gastroenterology', amount: 8420, riskScore: 82, claimHealth: 58, status: 'Pending Validation', stage: 'AI Validation Started' },
  { scenario: 'duplicateBilling', patient: 'Marcus Green', patientId: 'PT-2082', age: 61, gender: 'Male', diagnosis: 'Observation stay for chest pain', insurance: 'BlueCross Shield', assignedStaff: 'Daniel Scott', priority: 'High', department: 'Cardiology', amount: 12140, riskScore: 76, claimHealth: 66, status: 'Needs Review', stage: 'Billing Generated' },
  { scenario: 'codingMismatch', patient: 'Priya Rao', patientId: 'PT-2083', age: 53, gender: 'Female', diagnosis: 'Lumbar radiculopathy imaging', insurance: 'UnitedHealth', assignedStaff: 'Sofia Khan', priority: 'Urgent', department: 'Radiology', amount: 5630, riskScore: 88, claimHealth: 49, status: 'Rejected', stage: 'AI Validation Started' },
  { scenario: 'coverageIssue', patient: 'Owen Brooks', patientId: 'PT-2084', age: 37, gender: 'Male', diagnosis: 'Elective arthroscopy with pre-auth hold', insurance: 'Cigna', assignedStaff: 'Priya Nair', priority: 'High', department: 'Orthopedics', amount: 15490, riskScore: 71, claimHealth: 62, status: 'Pending Validation', stage: 'AI Validation Started' },
  { scenario: 'perfect', patient: 'Noah Bennett', patientId: 'PT-2085', age: 48, gender: 'Male', diagnosis: 'Well-documented follow-up evaluation', insurance: 'BlueCross Shield', assignedStaff: 'Maya Patel', priority: 'Low', department: 'Internal Medicine', amount: 6950, riskScore: 14, claimHealth: 96, status: 'Ready to Submit', stage: 'Ready for Submission' },
];

export function HospitalWorkflowProvider({ children }: PropsWithChildren) {
  const [claims, setClaims] = useState<ClaimRecord[]>(() => cloneClaims(claimsSeed));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [...notificationsSeed]);
  const [demoMode, setDemoMode] = useState<DemoModeState>(() => ({ ...demoModeSeed }));
  const [activityFeed, setActivityFeed] = useState<ClaimActivityEntry[]>(() => claimsSeed.flatMap((claim) => claim.activity).slice(0, 12));
  const [generatedDemoCount, setGeneratedDemoCount] = useState(0);

  useEffect(() => {
    fetchClaimsFromBackend()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setClaims(data);
        }
      })
      .catch(() => {
        // Fallback to initial seed if backend is offline
      });
  }, []);

  const metrics = useMemo(() => buildMetricSummary(claims), [claims]);
  const analyticsSummary = useMemo(() => buildAnalytics(claims, metrics), [claims, metrics]);

  const pushNotification = (item: NotificationItem) => {
    setNotifications((current) => [item, ...current].slice(0, 20));
  };

  const pushActivity = (entry: ClaimActivityEntry) => {
    setActivityFeed((current) => [entry, ...current].slice(0, 20));
  };

  const updateClaim = (claimId: string, updater: (claim: ClaimRecord) => ClaimRecord) => {
    setClaims((current) => current.map((claim) => (claim.claimId === claimId ? updater(claim) : claim)));
  };

  const getClaimById = (claimId: string) => claims.find((claim) => claim.claimId === claimId);

  const runAiReview = (claimId: string) => {
    setClaims((current) => current.map((claim) => {
      if (claim.claimId !== claimId) return claim;
      const scenario = scenarioForClaim(claim);
      const issues = validationIssuesSeed.filter((issue) => issue.title !== 'Documentation complete');
      const claimHealth = Math.min(99, claim.claimHealth + (scenario === 'perfect' ? 4 : 8));
      const denialRisk = Math.max(2, 100 - claimHealth);
      const aiReview = {
        ...claim.aiReview,
        claimHealth,
        denialRisk,
        reviewedAt: timeStamp(),
        issues: scenario === 'perfect' ? validationIssuesSeed : issues,
        recommendations: scenario === 'perfect' ? ['Claim is ready for submission.'] : issues.map((issue) => issue.recommendedFix),
        documentationScore: Math.min(99, claim.aiReview.documentationScore + 4),
        codingScore: Math.min(99, claim.aiReview.codingScore + 3),
        complianceScore: Math.min(99, claim.aiReview.complianceScore + 2),
        medicalNecessityScore: Math.min(99, claim.aiReview.medicalNecessityScore + 5),
      };

      return addActivity(
        {
          ...claim,
          aiReview,
          claimHealth,
          denialRisk,
          aiReviewStatus: 'In Review',
          submissionStatus: 'Pending Validation',
          status: 'Pending Validation',
        },
        'AI Engine',
        'AI review completed',
        `Claim health adjusted to ${claimHealth}.`,
      );
    }));

    pushNotification({ title: 'AI review completed', message: `Claim ${claimId} has been reviewed and synchronized across the workspace.`, timestamp: timeStamp(), tone: 'info', claimId });
  };

  const applyExternalAiReview = (claimId: string, review: AIReviewResult) => {
    setClaims((current) => current.map((claim) => {
      if (claim.claimId !== claimId) return claim;

      const nextClaim = updateTimeline({
        ...claim,
        claimHealth: review.claimHealth,
        denialRisk: review.denialRisk,
        aiReviewStatus: review.issues.length > 0 ? 'Needs Attention' : 'Approved',
        status: review.issues.length === 0 && review.claimHealth >= 85 ? 'Ready to Submit' : claim.status,
        submissionStatus: review.issues.length === 0 && review.claimHealth >= 85 ? 'Ready for Submission' : claim.submissionStatus,
        aiReview: {
          ...claim.aiReview,
          claimHealth: review.claimHealth,
          documentationScore: review.documentationScore,
          codingScore: review.codingScore,
          complianceScore: review.complianceScore,
          medicalNecessityScore: review.medicalNecessityScore,
          coverageValidation: review.coverageValidation,
          duplicateBillingCheck: review.duplicateBillingCheck,
          completenessCheck: review.completenessCheck,
          denialRisk: review.denialRisk,
          issues: review.issues,
          recommendations: review.recommendations,
          reviewedAt: review.reviewedAt,
        },
      }, review.issues.length === 0 && review.claimHealth >= 85 ? 'Ready for Submission' : 'AI Validation Started');

      return addActivity(nextClaim, 'Groq AI', 'AI review saved', review.summary ?? 'Groq review completed.');
    }));

    pushNotification({ title: 'Groq review completed', message: `Claim ${claimId} was reviewed and updated from the backend response.`, timestamp: timeStamp(), tone: 'info', claimId });
  };

  const applySuggestion = (claimId: string, issueTitle: string) => {
    setClaims((current) => current.map((claim) => {
      if (claim.claimId !== claimId) return claim;
      const issue = claim.aiReview.issues.find((item) => item.title === issueTitle);
      const claimHealth = Math.min(100, claim.claimHealth + (issue?.severity === 'Critical' ? 14 : 7));
      const denialRisk = Math.max(0, 100 - claimHealth);
      const nextClaim = updateTimeline(
        {
          ...claim,
          claimHealth,
          denialRisk,
          status: claimHealth >= 88 ? 'Ready to Submit' : claim.status,
          submissionStatus: claimHealth >= 88 ? 'Ready for Submission' : claim.submissionStatus,
          aiReviewStatus: 'Reviewed',
          aiReview: {
            ...claim.aiReview,
            claimHealth,
            denialRisk,
            issues: claim.aiReview.issues.filter((item) => item.title !== issueTitle),
            recommendations: claim.aiReview.recommendations.filter((item) => item !== issue?.recommendedFix),
            reviewedAt: timeStamp(),
          },
        },
        'Corrections Applied',
      );

      return addActivity(nextClaim, 'Maya Patel', 'AI recommendation accepted', issue?.recommendedFix ?? 'Correction applied from the review workspace.');
    }));

    pushNotification({ title: 'Correction applied', message: `Suggestion on ${claimId} was accepted and the claim health score improved.`, timestamp: timeStamp(), tone: 'success', claimId });
  };

  const ignoreSuggestion = (claimId: string, issueTitle: string) => {
    updateClaim(claimId, (claim) => addActivity({
      ...claim,
      aiReview: {
        ...claim.aiReview,
        issues: claim.aiReview.issues.filter((issue) => issue.title !== issueTitle),
      },
    }, 'Billing Staff', 'Suggestion ignored', `The team deferred ${issueTitle}.`));

    pushNotification({ title: 'Suggestion deferred', message: `A recommendation on ${claimId} was marked for manual follow-up.`, timestamp: timeStamp(), tone: 'warning', claimId });
  };

  const manualEdit = (claimId: string, field: 'status' | 'claimHealth' | 'denialRisk' | 'submissionStatus', value: string | number) => {
    updateClaim(claimId, (claim) => {
      const nextClaim = { ...claim, [field]: value } as ClaimRecord;
      if (field === 'claimHealth') nextClaim.denialRisk = Math.max(0, 100 - Number(value));
      if (field === 'denialRisk') nextClaim.claimHealth = Math.max(0, 100 - Number(value));
      return addActivity(nextClaim, 'Billing Staff', 'Manual edit saved', `${field} updated to ${value}.`);
    });
  };

  const markReadyForSubmission = (claimId: string) => {
    updateClaim(claimId, (claim) => addActivity(updateTimeline({
      ...claim,
      status: 'Ready to Submit',
      submissionStatus: 'Ready for Submission',
      aiReviewStatus: 'Approved',
      claimHealth: Math.max(claim.claimHealth, 92),
      denialRisk: Math.min(claim.denialRisk, 8),
    }, 'Ready for Submission'), 'System', 'Claim marked ready', 'Claim is ready for submission to insurance.'));
    pushNotification({ title: 'Claim ready', message: `${claimId} is ready for submission.`, timestamp: timeStamp(), tone: 'success', claimId });
  };

  const submitClaim = async (claimId: string) => {
    try {
      const result = await submitClaimApi(claimId);
      if (result.success && result.claim) {
        setClaims((current) => current.map((c) => (c.claimId === claimId ? result.claim : c)));
        pushNotification({
          title: `Claim ${result.claim.status}`,
          message: `${claimId} status updated to ${result.claim.status}.`,
          timestamp: timeStamp(),
          tone: result.claim.status === 'Approved' || result.claim.status === 'Paid' ? 'success' : result.claim.status === 'Rejected' ? 'critical' : 'info',
          claimId,
        });
        return;
      }
    } catch {
      // Fallback local update if backend fails
    }

    updateClaim(claimId, (claim) => addActivity(updateTimeline({
      ...claim,
      status: 'Submitted',
      submissionStatus: 'Submitted',
      currentStage: 'Submitted',
    }, 'Submitted'), 'System', 'Claim submitted', 'Insurance submission packet sent.'));
    pushNotification({ title: 'Claim submitted', message: `${claimId} was submitted for insurance review.`, timestamp: timeStamp(), tone: 'success', claimId });
  };

  const toggleDemoMode = (enabled?: boolean) => setDemoMode((current) => ({ ...current, enabled: enabled ?? !current.enabled, running: enabled ?? !current.enabled }));

  const setDemoSpeed = (speed: DemoModeState['speed']) => setDemoMode((current) => ({ ...current, speed }));
  const pauseSimulation = () => setDemoMode((current) => ({ ...current, running: false }));
  const resumeSimulation = () => setDemoMode((current) => ({ ...current, running: true, enabled: true }));
  const resetDemo = () => {
    setClaims(cloneClaims(claimsSeed));
    setNotifications([...notificationsSeed]);
    setActivityFeed(claimsSeed.flatMap((claim) => claim.activity).slice(0, 12));
    setGeneratedDemoCount(0);
    setDemoMode({ ...demoModeSeed, running: false, enabled: false });
  };

  const generateScenario = (scenario: ClaimScenario) => {
    if (generatedDemoCount >= demoClaimBlueprints.length) {
      const existing = jumpToHighRiskClaim() ?? claims[0];
      if (existing) {
        pushActivity({ timestamp: timeStamp(), actor: 'Demo Engine', action: 'Demo cap reached', detail: `Claim generation capped at ${demoClaimBlueprints.length} unique examples.` });
      }
      return existing ?? claimsSeed[0];
    }

    const blueprint = demoClaimBlueprints[generatedDemoCount % demoClaimBlueprints.length];
    const resolvedScenario = scenario ?? blueprint.scenario;
    const nextIndex = generatedDemoCount + 1;
    const claimId = `CLM-${25000 + nextIndex}`;
    const scenarioClaim = claimsSeed[(generatedDemoCount + 2) % claimsSeed.length];
    const generated: ClaimRecord = {
      ...scenarioClaim,
      claimId,
      patient: blueprint.patient,
      patientId: blueprint.patientId,
      age: blueprint.age,
      gender: blueprint.gender,
      diagnosis: blueprint.diagnosis,
      insurance: blueprint.insurance,
      status: blueprint.status,
      riskScore: blueprint.riskScore,
      claimHealth: blueprint.claimHealth,
      assignedStaff: blueprint.assignedStaff,
      priority: blueprint.priority,
      lastUpdated: timeStamp(),
      expectedCompletion: timeStamp(),
      department: blueprint.department,
      amount: blueprint.amount,
      stage: blueprint.stage,
      currentStage: blueprint.stage,
      aiReviewStatus: 'Reviewed',
      submissionStatus: blueprint.stage === 'Ready for Submission' ? 'Ready for Submission' : 'Pending Validation',
      aiReview: {
        ...scenarioClaim.aiReview,
        claimHealth: blueprint.claimHealth,
        denialRisk: 100 - blueprint.claimHealth,
        issues: validationIssuesSeed.filter((issue) => issue.title !== 'Documentation complete'),
        reviewedAt: timeStamp(),
      },
      denialRisk: 100 - blueprint.claimHealth,
      activity: [
        { timestamp: timeStamp(), actor: 'Demo Engine', action: 'Scenario generated', detail: `${resolvedScenario} claim created for presentation.` },
        ...scenarioClaim.activity,
      ],
      timeline: [...scenarioClaim.timeline, { stage: blueprint.stage, timestamp: timeStamp() }],
    };

    setClaims((current) => [generated, ...current]);
    setGeneratedDemoCount((current) => current + 1);
    pushNotification({ title: 'New claim created', message: `${claimId} was added for ${resolvedScenario.replace(/([A-Z])/g, ' $1').toLowerCase()} demo flow.`, timestamp: timeStamp(), tone: 'info', claimId });
    return generated;
  };

  const generateNewBatch = () => {
    generateScenario('missingDocumentation');
    generateScenario('duplicateBilling');
    setDemoMode((current) => ({ ...current, eventsGenerated: current.eventsGenerated + 3, claimsProcessed: current.claimsProcessed + 2 }));
  };

  const replayLastWorkflow = () => {
    const claim = claims[0];
    if (!claim) return;
    runAiReview(claim.claimId);
    applySuggestion(claim.claimId, claim.aiReview.issues[0]?.title ?? validationIssuesSeed[0].title);
    markReadyForSubmission(claim.claimId);
  };

  const jumpToHighRiskClaim = () => claims.slice().sort((left, right) => right.denialRisk - left.denialRisk)[0];

  const triggerDemoEvent = () => {
    setClaims((current) => {
      const next = cloneClaims(current);
      const ordered = next.slice().sort((left, right) => right.denialRisk - left.denialRisk);
      const target = ordered[0] ?? next[0];
      if (!target) return current;

      const scenario = scenarioForClaim(target);
      const advancedStage = nextStageFor(target);
      const escalatedRisk = scenario === 'coverageIssue' ? 4 : scenario === 'missingDocumentation' ? 3 : 1;
      const improvedHealth = scenario === 'perfect' ? 3 : 2;
      const updated = addActivity(updateTimeline({
        ...target,
        currentStage: advancedStage,
        stage: advancedStage,
        status: advancedStage === 'Approved' ? 'Approved' : advancedStage === 'Rejected' ? 'Rejected' : advancedStage === 'Submitted' ? 'Submitted' : target.status,
        submissionStatus: advancedStage === 'Ready for Submission' ? 'Ready for Submission' : advancedStage === 'Submitted' ? 'Submitted' : advancedStage === 'Under Insurance Review' ? 'Under Insurance Review' : target.submissionStatus,
        aiReviewStatus: advancedStage === 'Approved' ? 'Approved' : 'Reviewed',
        claimHealth: Math.min(100, target.claimHealth + improvedHealth),
        denialRisk: Math.max(0, target.denialRisk - escalatedRisk),
      }, advancedStage), 'Demo Engine', 'Workflow advanced', `${target.claimId} moved to ${advancedStage}.`);

      next[next.findIndex((claim) => claim.claimId === target.claimId)] = updated;
      return next;
    });

    const activeClaim = jumpToHighRiskClaim();
    const message = activeClaim
      ? `${activeClaim.claimId} progressed through ${activeClaim.currentStage.toLowerCase()} and the queue refreshed.`
      : 'The hospital queue updated.';

    pushActivity({ timestamp: timeStamp(), actor: 'Demo Engine', action: 'Hospital event generated', detail: message });
    pushNotification({ title: 'Live workflow update', message, timestamp: timeStamp(), tone: 'info', claimId: jumpToHighRiskClaim()?.claimId });
  };

  useEffect(() => {
    if (!demoMode.enabled || !demoMode.running) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const eventRoll = Math.random();
      if (eventRoll < 0.28) {
        triggerDemoEvent();
      } else if (eventRoll < 0.46) {
        const scenario = ['missingDocumentation', 'duplicateBilling', 'codingMismatch', 'coverageIssue', 'perfect'][Math.floor(Math.random() * 5)] as ClaimScenario;
        const claim = generateScenario(scenario);
        pushActivity({ timestamp: timeStamp(), actor: 'Admissions', action: 'New patient admitted', detail: `${claim.patient} entered the hospital workflow for ${claim.diagnosis.toLowerCase()}.` });
      } else if (eventRoll < 0.68) {
        const claim = jumpToHighRiskClaim();
        if (claim) {
          runAiReview(claim.claimId);
          pushActivity({ timestamp: timeStamp(), actor: 'AI Engine', action: 'Validation burst completed', detail: `${claim.claimId} was reviewed for documentation, coding, and coverage.` });
        }
      } else if (eventRoll < 0.84) {
        const claim = claims[0];
        if (claim?.aiReview.issues[0]) {
          applySuggestion(claim.claimId, claim.aiReview.issues[0].title);
        }
      } else {
        const claim = claims.find((item) => item.submissionStatus === 'Ready for Submission') ?? claims[0];
        if (claim) {
          markReadyForSubmission(claim.claimId);
        }
      }

      setDemoMode((current) => ({
        ...current,
        eventsGenerated: current.eventsGenerated + 1,
        claimsProcessed: current.claimsProcessed + 1,
        claimsApproved: current.claimsApproved + (eventRoll > 0.72 ? 1 : 0),
        claimsCorrected: current.claimsCorrected + (eventRoll > 0.34 && eventRoll < 0.84 ? 1 : 0),
        revenueProtected: current.revenueProtected + (eventRoll > 0.72 ? 18000 : eventRoll > 0.46 ? 9000 : 4500),
      }));
      pushNotification({
        title: eventRoll > 0.72 ? 'Claim approved' : eventRoll > 0.46 ? 'Documentation updated' : 'AI validation event',
        message: eventRoll > 0.72
          ? 'A claim moved into approved status and revenue protected increased.'
          : eventRoll > 0.46
            ? 'Documentation, coding, or billing changes were applied to the active queue.'
            : 'The AI validation pipeline processed a new claim event.',
        timestamp: timeStamp(),
        tone: eventRoll > 0.72 ? 'success' : eventRoll > 0.46 ? 'warning' : 'info',
      });
    }, demoMode.speed === 'Fast' ? 2400 : demoMode.speed === 'Presentation' ? 4200 : 5200);

    return () => window.clearInterval(interval);
  }, [demoMode.enabled, demoMode.running, demoMode.speed]);

  const value: HospitalWorkflowContextValue = {
    claims,
    notifications,
    metrics,
    analyticsSummary,
    demoMode,
    validationIssues: validationIssuesSeed,
    validationPipeline,
    getClaimById,
    updateClaim,
    runAiReview,
    applyExternalAiReview,
    applySuggestion,
    ignoreSuggestion,
    manualEdit,
    markReadyForSubmission,
    submitClaim,
    toggleDemoMode,
    setDemoSpeed,
    pauseSimulation,
    resumeSimulation,
    generateNewBatch,
    resetDemo,
    replayLastWorkflow,
    jumpToHighRiskClaim,
    generateScenario,
    activityFeed,
  };

  return <HospitalWorkflowContext.Provider value={value}>{children}</HospitalWorkflowContext.Provider>;
}

export function useHospitalWorkflow() {
  const context = useContext(HospitalWorkflowContext);
  if (!context) {
    throw new Error('useHospitalWorkflow must be used within HospitalWorkflowProvider');
  }

  return context;
}