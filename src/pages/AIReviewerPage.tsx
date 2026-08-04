import { useMemo, useState } from 'react';
import { Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';
import { reviewClaimWithGroq } from '../services/aiReviewerApi';

export function AIReviewerPage() {
  const { claims, getClaimById, applyExternalAiReview } = useHospitalWorkflow();
  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.claimId ?? '');
  const [isReviewing, setIsReviewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const selectedClaim = useMemo(() => getClaimById(selectedClaimId) ?? claims[0], [claims, getClaimById, selectedClaimId]);

  const [lastReview, setLastReview] = useState(selectedClaim?.aiReview ?? null);

  const handleGroqReview = async () => {
    if (!selectedClaim) {
      return;
    }

    setErrorMessage('');
    setIsReviewing(true);
    try {
      const review = await reviewClaimWithGroq(selectedClaim);
      setLastReview(review);
      applyExternalAiReview(selectedClaim.claimId, review);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Groq review failed';
      setErrorMessage(message === 'Unable to review claim' ? 'Backend unavailable. Start the local backend with npm run backend, then retry the claim review.' : message);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">AI Claim Reviewer</h1>
        <p className="mt-2 text-slate-500">Groq-powered review for one claim at a time, with no automatic generation or background AI usage.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          {['Select Claim', 'AI Reviewing', 'Results Ready'].map((step, index) => (
            <div key={step} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Step {index + 1}</div>
              <div className="mt-2 text-lg font-semibold">{step}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <select value={selectedClaimId} onChange={(event) => setSelectedClaimId(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            {claims.map((claim) => <option key={claim.claimId} value={claim.claimId}>{claim.claimId} - {claim.patient}</option>)}
          </select>
          <button onClick={handleGroqReview} disabled={isReviewing} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {isReviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isReviewing ? 'Running Groq Review' : 'Run Groq Review'}
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-400">Uses a single API call only when you click the button.</p>
        {errorMessage ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div> : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {(lastReview?.issues.length ? lastReview.issues : selectedClaim?.aiReview.issues ?? []).map((issue) => (
          <div key={issue.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">{issue.title}</div>
                <div className="text-sm text-slate-500">Severity: {issue.severity}</div>
              </div>
              <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Confidence {issue.confidence}%</div>
            </div>
            <p className="mt-4 text-sm text-slate-600">{issue.explanation}</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Evidence: {issue.evidence}</div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Suggested fix: {issue.recommendedFix}</div>
          </div>
        ))}
      </div>

      {lastReview ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="section-title">Groq Review Summary</div>
              <div className="section-subtitle">Applied to the selected claim after the API response returned.</div>
            </div>
            <ShieldAlert className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 text-sm text-slate-600">{lastReview.summary}</div>
        </div>
      ) : null}
    </div>
  );
}