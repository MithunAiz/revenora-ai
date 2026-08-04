import { Link } from 'react-router-dom';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

export function RejectedClaimsPage() {
  const { claims, applySuggestion, markReadyForSubmission } = useHospitalWorkflow();
  const rejected = claims.filter((claim) => claim.status === 'Rejected');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Rejected Claims</h1>
        <p className="mt-2 text-slate-500">Review rejection reasons, AI explanations, and resubmission readiness.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {rejected.map((claim) => (
          <div key={claim.claimId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{claim.claimId}</div>
                <div className="text-sm text-slate-500">{claim.patient}</div>
              </div>
              <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Rejected</div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Reason: {claim.aiReview.issues[0]?.explanation ?? 'Missing supporting documentation.'}</div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">AI correction: {claim.aiReview.issues[0]?.recommendedFix ?? 'Attach the missing document and resubmit.'}</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => applySuggestion(claim.claimId, claim.aiReview.issues[0]?.title ?? '')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Apply Fix</button>
              <button onClick={() => markReadyForSubmission(claim.claimId)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Revalidate</button>
              <Link to={`/billing/claims/${claim.claimId}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Open workspace</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}