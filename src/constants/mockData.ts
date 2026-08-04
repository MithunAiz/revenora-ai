import {
  AIReviewResult,
  AnalyticsSummary,
  BillingSummary,
  ClaimActivityEntry,
  ClaimDocument,
  ClaimRecord,
  ClaimStage,
  ClaimTimelineEntry,
  DemoModeState,
  HospitalMetrics,
  NotificationItem,
  ValidationIssue,
  ValidationMetric,
} from '../types';

const now = new Date();

const formatOffset = (minutes: number) => {
  const stamp = new Date(now.getTime() - minutes * 60_000);
  return stamp.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const stageSequence: ClaimStage[] = [
  'Claim Created',
  'Clinical Documentation Completed',
  'Medical Coding Completed',
  'Billing Generated',
  'AI Validation Started',
  'Corrections Applied',
  'Ready for Submission',
  'Submitted',
  'Under Insurance Review',
  'Approved',
  'Rejected',
  'Resubmitted',
  'Paid',
];

const documentFactory = (patient: string, diagnosis: string, physician: string): ClaimDocument[] => [
  {
    type: 'Doctor Notes',
    updatedAt: formatOffset(180),
    content: `Patient ${patient} presented with persistent symptoms consistent with ${diagnosis}. ${physician} documented examination findings, reviewed prior history, and ordered confirmatory testing.`,
  },
  {
    type: 'Consultation Notes',
    updatedAt: formatOffset(162),
    content: `Specialty consultation completed. Treatment options, risks, and expected recovery were reviewed with the patient. Conservative measures and follow-up instructions were documented in detail.`,
  },
  {
    type: 'Progress Notes',
    updatedAt: formatOffset(146),
    content: `Symptoms improved modestly after initial intervention. Pain levels, mobility, medication response, and discharge readiness were re-evaluated during the shift.`,
  },
  {
    type: 'Operative Notes',
    updatedAt: formatOffset(132),
    content: `Procedure completed without complication. Time-out verification, sterile field documentation, and intra-procedure observations were recorded by the surgical team.`,
  },
  {
    type: 'Discharge Summary',
    updatedAt: formatOffset(110),
    content: `Patient discharged in stable condition with medication reconciliation, activity restrictions, and follow-up instructions. Return precautions were reviewed with the family.`,
  },
  {
    type: 'Radiology Report',
    updatedAt: formatOffset(96),
    content: `Imaging demonstrates no acute fracture or obstruction. Mild degenerative changes are present, and findings correlate with the documented complaint.`,
  },
  {
    type: 'Laboratory Report',
    updatedAt: formatOffset(84),
    content: `CBC, metabolic panel, and inflammatory markers were reviewed. Results support the assessment and did not reveal acute systemic instability.`,
  },
  {
    type: 'Prescription',
    updatedAt: formatOffset(72),
    content: `Discharge medication list includes analgesic therapy, supportive treatment, and clear instructions for dosage, precautions, and follow-up.`,
  },
];

const buildTimeline = (status: ClaimRecord['status'], offset: number): ClaimTimelineEntry[] => {
  const base = [
    'Claim Created',
    'Clinical Documentation Completed',
    'Medical Coding Completed',
    'Billing Generated',
    'AI Validation Started',
    'Corrections Applied',
    'Ready for Submission',
  ] as ClaimStage[];

  const terminalStages: ClaimStage[] = [];
  if (status === 'Approved' || status === 'Submitted') {
    terminalStages.push('Submitted', 'Under Insurance Review', 'Approved');
  } else if (status === 'Rejected') {
    terminalStages.push('Submitted', 'Under Insurance Review', 'Rejected');
  } else if (status === 'Paid') {
    terminalStages.push('Submitted', 'Under Insurance Review', 'Approved', 'Paid');
  }

  return [...base, ...terminalStages].map((stage, index) => ({
    stage,
    timestamp: formatOffset(offset + (base.length + index) * 12),
  }));
};

const buildActivity = (claimId: string, assignedStaff: string, delta: string): ClaimActivityEntry[] => [
  { timestamp: formatOffset(38), actor: assignedStaff, action: 'Claim routed', detail: `${claimId} moved into the active review queue.` },
  { timestamp: formatOffset(26), actor: 'Maya Patel', action: 'AI recommendation accepted', detail: `Suggested correction accepted and routed back to validation. ${delta}` },
  { timestamp: formatOffset(14), actor: 'System', action: 'Dashboard refreshed', detail: `Claim health, queue counts, and notification feed updated for ${claimId}.` },
];

const buildAiReview = (claimHealth: number, denialRisk: number, issues: ValidationIssue[]): AIReviewResult => ({
  claimHealth,
  documentationScore: Math.max(58, claimHealth - 6),
  codingScore: Math.max(54, claimHealth - 8),
  complianceScore: Math.max(70, claimHealth - 3),
  medicalNecessityScore: Math.max(60, claimHealth - 12),
  coverageValidation: {
    label: 'Coverage Validation',
    value: claimHealth >= 80 ? 94 : 76,
    status: claimHealth >= 80 ? 'Passed' : 'Warning',
    explanation: claimHealth >= 80 ? 'Insurance benefits appear active and within policy limits.' : 'Prior authorization or coverage confirmation is recommended before submission.',
  },
  duplicateBillingCheck: {
    label: 'Duplicate Billing Check',
    value: claimHealth >= 75 ? 97 : 71,
    status: claimHealth >= 75 ? 'Passed' : 'Warning',
    explanation: claimHealth >= 75 ? 'No duplicate billing patterns were detected in the current service lines.' : 'A duplicate service code pattern should be reviewed against recent encounters.',
  },
  completenessCheck: {
    label: 'Completeness Check',
    value: claimHealth >= 78 ? 96 : 69,
    status: claimHealth >= 78 ? 'Passed' : 'Warning',
    explanation: claimHealth >= 78 ? 'Clinical packet includes required supporting documents and signatures.' : 'At least one required attachment or signature is missing from the claim packet.',
  },
  denialRisk,
  issues,
  recommendations: issues.map((issue) => issue.recommendedFix),
  reviewedAt: formatOffset(8),
});

const createValidationIssues = (scenario: string): ValidationIssue[] => {
  const issueLibrary: Record<string, ValidationIssue[]> = {
    missingDocumentation: [
      {
        title: 'Discharge summary missing',
        severity: 'Critical',
        explanation: 'The claim packet does not include a discharge summary, which weakens the evidence for medical necessity and final disposition.',
        suggestion: 'Attach the discharge summary and confirm signature completion.',
        confidence: 95,
        affectedDocumentation: 'Discharge Summary',
        affectedCode: 'DX SUPPORT',
        evidence: 'Clinical notes reference discharge planning, but no signed discharge summary is attached.',
        recommendedFix: 'Upload the discharge summary and re-run validation.',
        whyItMatters: 'Missing discharge documentation is a common denial trigger when insurers audit inpatient or procedural claims.',
      },
      {
        title: 'Medical necessity support is weak',
        severity: 'Warning',
        explanation: 'Supporting notes do not fully justify the selected level of service or procedure intensity.',
        suggestion: 'Expand the exam, history, or conservative treatment history.',
        confidence: 88,
        affectedDocumentation: 'Doctor Notes',
        affectedCode: 'CPT 99214',
        evidence: 'Documentation focuses on symptoms but is sparse on prior treatment failure.',
        recommendedFix: 'Add supporting clinical rationale before submission.',
        whyItMatters: 'Insurers often downcode or deny claims when clinical support is insufficient for the billed service.',
      },
    ],
    duplicateBilling: [
      {
        title: 'Potential duplicate facility charge',
        severity: 'Warning',
        explanation: 'Two similar facility fees appear on the same date of service with closely aligned timestamps.',
        suggestion: 'Confirm whether one line should be removed or adjusted.',
        confidence: 93,
        affectedDocumentation: 'Billing ledger',
        affectedCode: 'REV 0450',
        evidence: 'Charge description and amount are repeated across adjacent line items.',
        recommendedFix: 'Remove the duplicate line or document distinct service timing.',
        whyItMatters: 'Duplicate billing is a frequent post-submission denial reason and can trigger audit review.',
      },
      {
        title: 'Coding bundle needs reconciliation',
        severity: 'Critical',
        explanation: 'Procedure and modifier combination does not match the documented treatment sequence.',
        suggestion: 'Review the modifier set against the operative record.',
        confidence: 90,
        affectedDocumentation: 'Procedure notes',
        affectedCode: 'CPT 27447',
        evidence: 'Operative text supports only one side of the intervention, but the modifier implies bilateral service.',
        recommendedFix: 'Correct the modifier or update the operative note if clinically appropriate.',
        whyItMatters: 'Incorrect modifiers can cause outright claim rejection or reduced reimbursement.',
      },
    ],
    codingMismatch: [
      {
        title: 'Procedure code appears unsupported',
        severity: 'Critical',
        explanation: 'The procedure code is more intensive than the description in the doctor notes.',
        suggestion: 'Verify the procedure or update documentation with operative detail.',
        confidence: 93,
        affectedDocumentation: 'Doctor Notes',
        affectedCode: 'CPT 72148',
        evidence: 'Notes describe a routine evaluation, but a higher-intensity imaging code was submitted.',
        recommendedFix: 'Align the code set with documented service intensity.',
        whyItMatters: 'A coding mismatch leads directly to denials and can delay patient billing.',
      },
    ],
    coverageIssue: [
      {
        title: 'Prior authorization required',
        severity: 'Critical',
        explanation: 'The insurer policy for this service requires prior authorization before claim submission.',
        suggestion: 'Submit authorization details or hold the claim until approval is received.',
        confidence: 96,
        affectedDocumentation: 'Insurance rules',
        affectedCode: 'AUTH CHECK',
        evidence: 'Coverage validation indicates the service is subject to pre-auth policy.',
        recommendedFix: 'Attach the authorization reference number and resubmit.',
        whyItMatters: 'Claims without prior authorization are commonly denied even when documentation is complete.',
      },
    ],
    perfect: [
      {
        title: 'Documentation complete',
        severity: 'Info',
        explanation: 'All required documents are present and internally consistent.',
        suggestion: 'Ready for submission.',
        confidence: 99,
        affectedDocumentation: 'Entire claim packet',
        affectedCode: 'ALL',
        evidence: 'Clinical notes, discharge summary, coding, and billing are aligned.',
        recommendedFix: 'No correction required.',
        whyItMatters: 'A complete claim minimizes denial risk and speeds reimbursement.',
      },
    ],
  };

  return issueLibrary[scenario] ?? issueLibrary.missingDocumentation;
};

const createClaim = (
  claimId: string,
  patient: string,
  patientId: string,
  age: number,
  gender: 'Female' | 'Male' | 'Other',
  diagnosis: string,
  insurance: string,
  status: ClaimRecord['status'],
  riskScore: number,
  claimHealth: number,
  assignedStaff: string,
  priority: ClaimRecord['priority'],
  department: string,
  amount: number,
  stage: ClaimStage,
  scenario: string,
  assignedToMe: boolean,
  offset: number,
): ClaimRecord => {
  const physician = ['Dr. Hannah Lee', 'Dr. Marcus Ortiz', 'Dr. Priya Nair', 'Dr. James Chen'][offset % 4];
  const documents = documentFactory(patient, diagnosis, physician);
  const issues = createValidationIssues(scenario);
  const aiReview = buildAiReview(claimHealth, 100 - riskScore, issues);
  const billing: BillingSummary = {
    hospitalCharges: Math.round(amount * 0.38),
    departmentCharges: Math.round(amount * 0.19),
    procedureCharges: Math.round(amount * 0.24),
    insuranceCoverage: Math.round(amount * 0.72),
    patientResponsibility: Math.round(amount * 0.18),
    discounts: Math.round(amount * 0.04),
    grandTotal: amount,
  };

  return {
    claimId,
    patient,
    patientId,
    age,
    gender,
    admissionDate: formatOffset(540 + offset * 7),
    dischargeDate: formatOffset(360 + offset * 5),
    primaryPhysician: physician,
    diagnosis,
    insurance,
    status,
    riskScore,
    claimHealth,
    assignedStaff,
    priority,
    lastUpdated: formatOffset(42 + offset * 2),
    expectedCompletion: formatOffset(18 + offset),
    department,
    amount,
    stage,
    aiReviewStatus: status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Needs Attention' : 'Reviewed',
    submissionStatus: status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : status === 'Ready to Submit' ? 'Ready for Submission' : 'Pending Validation',
    denialRisk: 100 - claimHealth,
    assignedToMe: assignedToMe,
    currentStage: stage,
    documents,
    coding: {
      icdCodes: scenario === 'codingMismatch' ? ['M54.16', 'R10.9'] : ['K35.80', 'M54.16'],
      procedureCodes: scenario === 'codingMismatch' ? ['72148', '99214'] : ['44970', '99214'],
      modifiers: scenario === 'duplicateBilling' ? ['25', '59'] : ['25'],
    },
    billing,
    aiReview,
    timeline: buildTimeline(status, offset),
    activity: buildActivity(claimId, assignedStaff, issues[0]?.title ?? 'Claim reviewed'),
  };
};

export const claims: ClaimRecord[] = [
  createClaim('CLM-24081', 'Avery Chen', 'PT-1024', 42, 'Female', 'Acute appendicitis', 'BlueCross Shield', 'Pending Validation', 74, 82, 'Maya Patel', 'High', 'General Surgery', 18420, 'AI Validation Started', 'missingDocumentation', true, 1),
  createClaim('CLM-24082', 'Noah Williams', 'PT-1031', 58, 'Male', 'Type 2 diabetes mellitus', 'Aetna', 'Approved', 18, 96, 'Daniel Scott', 'Low', 'Endocrinology', 8620, 'Approved', 'perfect', false, 2),
  createClaim('CLM-24083', 'Isabella Johnson', 'PT-1044', 67, 'Female', 'MRI lumbar spine', 'UnitedHealth', 'Rejected', 91, 47, 'Sofia Khan', 'Urgent', 'Radiology', 5200, 'Rejected', 'codingMismatch', true, 3),
  createClaim('CLM-24084', 'Ethan Brooks', 'PT-1055', 36, 'Male', 'Knee arthroscopy', 'Cigna', 'Needs Review', 63, 68, 'Priya Nair', 'Medium', 'Orthopedics', 13240, 'Corrections Applied', 'duplicateBilling', false, 4),
  createClaim('CLM-24085', 'Mia Patel', 'PT-1062', 51, 'Female', 'Chest pain evaluation', 'BlueShield', 'Ready to Submit', 25, 93, 'Maya Patel', 'Medium', 'Cardiology', 9750, 'Ready for Submission', 'perfect', true, 5),
  createClaim('CLM-24086', 'Lucas Martin', 'PT-1070', 29, 'Male', 'Gallbladder disease', 'UnitedHealth', 'Pending Validation', 79, 61, 'Daniel Scott', 'High', 'General Surgery', 14980, 'AI Validation Started', 'coverageIssue', false, 6),
  createClaim('CLM-24087', 'Olivia Garcia', 'PT-1088', 64, 'Female', 'Syncope workup', 'Aetna', 'Approved', 14, 97, 'Sofia Khan', 'Low', 'Internal Medicine', 4980, 'Approved', 'perfect', false, 7),
  createClaim('CLM-24088', 'Benjamin Reed', 'PT-1093', 73, 'Male', 'COPD exacerbation', 'BlueCross Shield', 'Rejected', 88, 43, 'Priya Nair', 'Urgent', 'Pulmonology', 11210, 'Rejected', 'missingDocumentation', true, 8),
  createClaim('CLM-24089', 'Harper Singh', 'PT-1102', 47, 'Female', 'Laparoscopic hysterectomy', 'Cigna', 'Under Insurance Review', 54, 78, 'Maya Patel', 'High', 'Gynecology', 19840, 'Submitted', 'duplicateBilling', true, 9),
  createClaim('CLM-24090', 'Elijah Torres', 'PT-1114', 55, 'Male', 'Severe migraine', 'UnitedHealth', 'Pending Validation', 67, 74, 'Daniel Scott', 'Medium', 'Neurology', 7240, 'Medical Coding Completed', 'codingMismatch', false, 10),
  createClaim('CLM-24091', 'Sophia Nguyen', 'PT-1120', 39, 'Female', 'Pneumonia admission', 'Aetna', 'Ready to Submit', 33, 90, 'Sofia Khan', 'Medium', 'Pulmonology', 16340, 'Corrections Applied', 'perfect', false, 11),
  createClaim('CLM-24092', 'James Walker', 'PT-1132', 61, 'Male', 'Spinal decompression', 'BlueCross Shield', 'Rejected', 94, 39, 'Priya Nair', 'Urgent', 'Orthopedics', 25420, 'Rejected', 'missingDocumentation', true, 12),
];

export const notifications: NotificationItem[] = [
  { title: 'Claim approved', message: 'CLM-24082 cleared all compliance checks and moved to paid status.', timestamp: formatOffset(5), tone: 'success', claimId: 'CLM-24082' },
  { title: 'Compliance alert', message: 'Policy mismatch detected for CLM-24083 during code validation.', timestamp: formatOffset(12), tone: 'critical', claimId: 'CLM-24083' },
  { title: 'New AI suggestion', message: 'Suggested CPT correction available for CLM-24084.', timestamp: formatOffset(18), tone: 'info', claimId: 'CLM-24084' },
  { title: 'Insurance update', message: 'BlueCross policy rules refreshed successfully.', timestamp: formatOffset(45), tone: 'warning' },
  { title: 'Claim ready', message: 'CLM-24085 is ready for submission after validation.', timestamp: formatOffset(58), tone: 'success', claimId: 'CLM-24085' },
];

export const validationIssues: ValidationIssue[] = createValidationIssues('missingDocumentation');

export const demoModeState: DemoModeState = {
  enabled: true,
  speed: 'Presentation',
  running: true,
  eventsGenerated: 24,
  claimsProcessed: 87,
  claimsApproved: 61,
  claimsCorrected: 18,
  revenueProtected: 1240000,
};

export const metrics: HospitalMetrics = {
  todaysClaims: 248,
  pendingValidation: 36,
  approvedClaims: 189,
  rejectedClaims: 23,
  averageClaimHealth: 89,
  averageDenialRisk: 14,
  revenueProtected: 1240000,
  claimsSaved: 64,
  averageReviewTime: '4.2m',
};

export const analyticsSummary: AnalyticsSummary = {
  approvalRate: 94.8,
  denialTrend: [14, 13, 12, 11, 10, 9, 8, 7, 6],
  topDenialReasons: [
    { label: 'Missing documentation', value: 36 },
    { label: 'Coding mismatch', value: 24 },
    { label: 'Coverage policy', value: 18 },
    { label: 'Duplicate billing', value: 11 },
  ],
  codingErrors: [
    { label: 'Unsupported procedure', value: 31 },
    { label: 'Modifier mismatch', value: 26 },
    { label: 'ICD specificity gap', value: 18 },
    { label: 'Unbundled service', value: 12 },
  ],
  departmentRisk: [
    { label: 'General Surgery', value: 28 },
    { label: 'Orthopedics', value: 22 },
    { label: 'Radiology', value: 20 },
    { label: 'Cardiology', value: 15 },
    { label: 'Pulmonology', value: 10 },
  ],
  revenueRecovery: [12, 18, 24, 31, 29, 36, 38, 42, 47, 50],
  claimHealthDistribution: [
    { label: '0-49', value: 9 },
    { label: '50-69', value: 18 },
    { label: '70-84', value: 31 },
    { label: '85-100', value: 42 },
  ],
  aiDetectionAccuracy: 96.4,
  validationSuccessRate: 91.8,
};

export const validationPipeline = [
  'Clinical Documentation',
  'Medical Coding',
  'Billing Validation',
  'Insurance Rule Validation',
  'Compliance Validation',
  'Claim Quality',
  'Ready for Submission',
];

export const scenarioLabels = {
  missingDocumentation: 'Missing Documentation',
  duplicateBilling: 'Duplicate Billing',
  codingMismatch: 'Coding Mismatch',
  coverageIssue: 'Coverage Issue',
  perfect: 'Perfect Claim',
} as const;