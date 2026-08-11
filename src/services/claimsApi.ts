import { ClaimRecord, PatientFeedback } from '../types';

const API_BASE = '/api';

export async function fetchClaimsFromBackend(): Promise<ClaimRecord[]> {
  const response = await fetch(`${API_BASE}/claims`);
  if (!response.ok) throw new Error('Failed to fetch claims');
  return response.json();
}

export async function fetchClaimByIdFromBackend(claimId: string): Promise<ClaimRecord> {
  const response = await fetch(`${API_BASE}/claims/${claimId}`);
  if (!response.ok) throw new Error('Claim not found');
  return response.json();
}

export async function submitClaimApi(claimId: string): Promise<{ success: boolean; claim: ClaimRecord }> {
  const response = await fetch(`${API_BASE}/claims/${claimId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to submit claim');
  return response.json();
}

export async function resubmitClaimApi(
  claimId: string,
  corrections: { icdCodes?: string[]; procedureCodes?: string[]; modifiers?: string[]; documentText?: string; documentType?: string; notes?: string }
): Promise<{ success: boolean; claim: ClaimRecord }> {
  const response = await fetch(`${API_BASE}/claims/${claimId}/resubmit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corrections),
  });
  if (!response.ok) throw new Error('Failed to resubmit claim');
  return response.json();
}

export async function fetchFeedbackFromBackend(): Promise<PatientFeedback[]> {
  const response = await fetch(`${API_BASE}/feedback`);
  if (!response.ok) throw new Error('Failed to fetch feedback');
  return response.json();
}

export async function saveFeedbackToBackend(feedback: Partial<PatientFeedback>): Promise<{ id: string; success: boolean }> {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  if (!response.ok) throw new Error('Failed to save feedback');
  return response.json();
}
