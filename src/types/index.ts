export type Role = 'Patient Portal' | 'Billing Staff Portal' | 'Administrator Portal';

export type ClaimStatus =
  | 'Approved'
  | 'Pending Validation'
  | 'Rejected'
  | 'Needs Review'
  | 'Ready to Submit'
  | 'Submitted'
  | 'Under Insurance Review'
  | 'Paid';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ClaimStage =
  | 'Claim Created'
  | 'Clinical Documentation Completed'
  | 'Medical Coding Completed'
  | 'Billing Generated'
  | 'AI Validation Started'
  | 'Corrections Applied'
  | 'Ready for Submission'
  | 'Submitted'
  | 'Under Insurance Review'
  | 'Approved'
  | 'Rejected'
  | 'Resubmitted'
  | 'Paid';

export type DocumentType =
  | 'Doctor Notes'
  | 'Consultation Notes'
  | 'Progress Notes'
  | 'Operative Notes'
  | 'Discharge Summary'
  | 'Radiology Report'
  | 'Laboratory Report'
  | 'Prescription';

export type ValidationSeverity = 'Info' | 'Warning' | 'Critical';

export type ValidationStatus = 'Passed' | 'Warning' | 'Failed';

export interface DenialIntelligence {
  confidence?: number;
  rootCause?: string;
  evidence?: string;
  suggestedFix?: string;
  affectedDocument?: string;
  affectedCode?: string;
  rationale?: string;
  timestamp?: string;
}

export interface ClaimRecord {
  claimId: string;
  patient: string;
  patientId: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  admissionDate: string;
  dischargeDate: string;
  primaryPhysician: string;
  diagnosis: string;
  insurance: string;
  status: ClaimStatus;
  riskScore: number;
  claimHealth: number;
  assignedStaff: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  lastUpdated: string;
  expectedCompletion: string;
  department: string;
  amount: number;
  stage: ClaimStage;
  aiReviewStatus: 'Not Started' | 'In Review' | 'Reviewed' | 'Needs Attention' | 'Approved';
  submissionStatus: 'Draft' | 'Pending Validation' | 'Ready for Submission' | 'Submitted' | 'Under Insurance Review' | 'Approved' | 'Rejected' | 'Paid';
  denialRisk: number;
  assignedToMe: boolean;
  currentStage: ClaimStage;
  documents: ClaimDocument[];
  coding: CodingBundle;
  billing: BillingSummary;
  aiReview: AIReviewResult;
  timeline: ClaimTimelineEntry[];
  activity: ClaimActivityEntry[];
  denialIntelligence?: DenialIntelligence;
}

export interface ValidationIssue {
  title: string;
  severity: ValidationSeverity;
  explanation: string;
  suggestion: string;
  confidence: number;
  affectedDocumentation: string;
  affectedCode: string;
  evidence: string;
  recommendedFix: string;
  whyItMatters: string;
}

export interface NotificationItem {
  title: string;
  message: string;
  timestamp: string;
  tone: 'success' | 'warning' | 'critical' | 'info';
  claimId?: string;
}

export interface ClaimDocument {
  type: DocumentType;
  content: string;
  updatedAt: string;
}

export interface CodingBundle {
  icdCodes: string[];
  procedureCodes: string[];
  modifiers: string[];
}

export interface BillingSummary {
  hospitalCharges: number;
  departmentCharges: number;
  procedureCharges: number;
  insuranceCoverage: number;
  patientResponsibility: number;
  discounts: number;
  grandTotal: number;
}

export interface ValidationMetric {
  label: string;
  value: number;
  status: ValidationStatus;
  explanation: string;
}

export interface AIReviewResult {
  claimHealth: number;
  documentationScore: number;
  codingScore: number;
  complianceScore: number;
  medicalNecessityScore: number;
  coverageValidation: ValidationMetric;
  duplicateBillingCheck: ValidationMetric;
  completenessCheck: ValidationMetric;
  denialRisk: number;
  issues: ValidationIssue[];
  recommendations: string[];
  reviewedAt?: string;
  summary?: string;
}

export interface ClaimTimelineEntry {
  stage: ClaimStage;
  timestamp: string;
}

export interface ClaimActivityEntry {
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface DemoModeState {
  enabled: boolean;
  speed: 'Normal' | 'Fast' | 'Presentation' | 'Custom';
  running: boolean;
  eventsGenerated: number;
  claimsProcessed: number;
  claimsApproved: number;
  claimsCorrected: number;
  revenueProtected: number;
}

export interface HospitalMetrics {
  todaysClaims: number;
  pendingValidation: number;
  approvedClaims: number;
  rejectedClaims: number;
  averageClaimHealth: number;
  averageDenialRisk: number;
  revenueProtected: number;
  claimsSaved: number;
  averageReviewTime: string;
}

export interface AnalyticsSummary {
  approvalRate: number;
  denialTrend: number[];
  topDenialReasons: Array<{ label: string; value: number }>;
  codingErrors: Array<{ label: string; value: number }>;
  departmentRisk: Array<{ label: string; value: number }>;
  revenueRecovery: number[];
  claimHealthDistribution: Array<{ label: string; value: number }>;
  aiDetectionAccuracy: number;
  validationSuccessRate: number;
}

export interface PatientFeedback {
  id: string;
  createdAt: string;
  patientName: string;
  claimId: string;
  overallExperience: number;
  statusClarity: number;
  paymentClarity: number;
  supportHelpfulness: number;
  wouldRecommend: boolean;
  followUpNeeded: boolean;
  comments: string;
}
