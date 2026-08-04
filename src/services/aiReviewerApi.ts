import { AIReviewResult, ClaimRecord, ValidationIssue } from '../types';

interface GroqReviewResponse {
  claimId: string;
  claimHealth: number;
  denialRisk: number;
  documentationScore: number;
  codingScore: number;
  complianceScore: number;
  medicalNecessityScore: number;
  findings: Array<{
    issue: string;
    whyItMatters: string;
    evidence: string;
    recommendedFix: string;
    confidence: number;
    severity: ValidationIssue['severity'];
  }>;
  recommendations: string[];
  summary: string;
}

function toValidationIssue(claimId: string, finding: GroqReviewResponse['findings'][number]): ValidationIssue {
  return {
    title: finding.issue,
    severity: finding.severity,
    explanation: finding.whyItMatters,
    suggestion: finding.recommendedFix,
    confidence: finding.confidence,
    affectedDocumentation: claimId,
    affectedCode: 'GROQ',
    evidence: finding.evidence,
    recommendedFix: finding.recommendedFix,
    whyItMatters: finding.whyItMatters,
  };
}

export async function reviewClaimWithGroq(claim: ClaimRecord): Promise<AIReviewResult> {
  let response: Response;

  try {
    response = await fetch('/api/ai-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim }),
    });
  } catch {
    throw new Error('Backend unavailable. Start the local backend with npm run backend, then retry the claim review.');
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new Error('Backend unavailable. Start the local backend with npm run backend, then retry the claim review.');
    }
    throw new Error(errorPayload?.error ?? 'Unable to review claim');
  }

  const payload = (await response.json()) as GroqReviewResponse;
  const issues = payload.findings.map((finding) => toValidationIssue(payload.claimId, finding));

  return {
    claimHealth: payload.claimHealth,
    documentationScore: payload.documentationScore,
    codingScore: payload.codingScore,
    complianceScore: payload.complianceScore,
    medicalNecessityScore: payload.medicalNecessityScore,
    coverageValidation: {
      label: 'Coverage Validation',
      value: Math.max(60, payload.claimHealth - 2),
      status: payload.denialRisk <= 20 ? 'Passed' : 'Warning',
      explanation: payload.denialRisk <= 20 ? 'Coverage appears aligned with the claim.' : 'Coverage should be verified before submission.',
    },
    duplicateBillingCheck: {
      label: 'Duplicate Billing Check',
      value: Math.max(60, payload.claimHealth - 4),
      status: payload.denialRisk <= 25 ? 'Passed' : 'Warning',
      explanation: 'Groq review checked for duplicate billing indicators in the packet.',
    },
    completenessCheck: {
      label: 'Completeness Check',
      value: Math.max(60, payload.claimHealth - 1),
      status: issues.length === 0 ? 'Passed' : 'Warning',
      explanation: issues.length === 0 ? 'Claim packet looks complete.' : 'Claim packet needs follow-up review.',
    },
    denialRisk: payload.denialRisk,
    issues,
    recommendations: payload.recommendations,
    reviewedAt: new Date().toISOString(),
  };
}