import { Link } from 'react-router-dom';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

export function PatientDashboardPage() {
  const { claims } = useHospitalWorkflow();
  const claim = claims[0];
  const patientStatus = claim.submissionStatus === 'Approved'
    ? 'Your claim has been approved.'
    : claim.submissionStatus === 'Rejected'
      ? 'Your claim needs attention before it can move forward.'
      : claim.submissionStatus === 'Ready for Submission'
        ? 'Your care team is preparing the claim for submission.'
        : 'Your claim is being reviewed by the billing team.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Patient Portal</h1>
        <p className="mt-2 text-slate-500">Check your claim progress, any documents needed, and your payment summary in simple language.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {['Submitted', 'Being Reviewed', 'Ready to Submit', 'Approved', 'Paid'].map((step, index) => (
          <div key={step} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Step {index + 1}</div>
            <div className="mt-2 text-lg font-semibold">{step}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Claim Status</div>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Claim number:</span> {claim.claimId}</p>
            <p><span className="font-semibold text-slate-900">Current update:</span> {patientStatus}</p>
            <p><span className="font-semibold text-slate-900">Expected update by:</span> {claim.expectedCompletion}</p>
            <p>We are checking the hospital records, the bill, and your insurance coverage before anything is sent out.</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">If we need anything from you</div>
              <div className="mt-2">We’ll ask for a discharge summary, insurance approval, or a signature only if it is required.</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Payment Summary</div>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Total hospital charges:</span> ${claim.billing.grandTotal.toLocaleString()}</p>
            <p><span className="font-semibold text-slate-900">What insurance may cover:</span> ${claim.billing.insuranceCoverage.toLocaleString()}</p>
            <p><span className="font-semibold text-slate-900">Estimated amount for you:</span> ${claim.billing.patientResponsibility.toLocaleString()}</p>
            <p><span className="font-semibold text-slate-900">Need help?</span> Contact the care team if you want a status explanation.</p>
            <Link to="/patient/feedback" className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Share Feedback</Link>
          </div>
        </div>
      </div>
    </div>
  );
}