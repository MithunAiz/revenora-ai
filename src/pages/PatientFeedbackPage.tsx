import { useState } from 'react';
import { CheckCircle2, MessageSquare, Star, ThumbsUp, Send } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';
import { submitPatientFeedback } from '../services/feedbackStore';

const scaleOptions = [1, 2, 3, 4, 5];

export function PatientFeedbackPage() {
  const { claims } = useHospitalWorkflow();
  const claim = claims[0];
  const [patientName, setPatientName] = useState(claim?.patient || 'Rajesh Sharma');
  const [claimId, setClaimId] = useState(claim?.claimId || 'CLM-24081');
  const [overallExperience, setOverallExperience] = useState(5);
  const [statusClarity, setStatusClarity] = useState(5);
  const [paymentClarity, setPaymentClarity] = useState(4);
  const [supportHelpfulness, setSupportHelpfulness] = useState(5);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    submitPatientFeedback({
      patientName,
      claimId,
      overallExperience,
      statusClarity,
      paymentClarity,
      supportHelpfulness,
      wouldRecommend,
      followUpNeeded,
      comments,
    });
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Patient Experience Feedback</h1>
        <p className="mt-1.5 text-slate-500">Your feedback is securely recorded in our hospital database and reviewed directly by the Administrator team.</p>
      </div>

      {submitted ? (
        <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-10 text-center shadow-lg space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-950">Feedback Received!</h2>
          <p className="max-w-xl mx-auto text-sm font-medium text-emerald-900 leading-relaxed">
            Thank you, <span className="font-bold">{patientName}</span>! Your feedback regarding claim <span className="font-bold">{claimId}</span> has been saved in our hospital database. The Administrator team reviews all submissions to improve hospital billing transparency.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition"
          >
            Submit Another Feedback
          </button>
        </div>
      ) : (
        /* Full-Width Page Form Layout */
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-bold text-slate-900">Patient Full Name</span>
              <input
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-slate-900"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-bold text-slate-900">Associated Claim Number</span>
              <select
                value={claimId}
                onChange={(event) => setClaimId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-slate-900"
              >
                {claims.map((item) => (
                  <option key={item.claimId} value={item.claimId}>
                    {item.claimId} - {item.patient} ({item.insurance})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-5 pt-2">
            {[
              ['How would you rate your overall hospital billing experience?', overallExperience, setOverallExperience],
              ['How clear were the claim status & timeline updates?', statusClarity, setStatusClarity],
              ['How clear was the payment & co-pay summary?', paymentClarity, setPaymentClarity],
              ['How helpful was the care & billing support team?', supportHelpfulness, setSupportHelpfulness],
            ].map(([label, value, setter]) => (
              <div key={label as string} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-bold text-slate-900">{label as string}</div>
                  <div className="text-sm font-extrabold text-slate-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200">
                    {value as number} / 5
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {scaleOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => (setter as (val: number) => void)(option)}
                      className={`h-11 w-11 rounded-2xl text-sm font-bold transition ${
                        value === option
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 pt-2">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-3">
              <span className="font-bold text-slate-900 text-sm">Would you recommend our hospital billing service?</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                    wouldRecommend ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Yes, Definitely
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                    !wouldRecommend ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Needs Improvement
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-3">
              <span className="font-bold text-slate-900 text-sm">Do you request a follow-up call from care support?</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFollowUpNeeded(false)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                    !followUpNeeded ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  No Follow-Up Needed
                </button>
                <button
                  type="button"
                  onClick={() => setFollowUpNeeded(true)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                    followUpNeeded ? 'bg-amber-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Yes, Please Call Me
                </button>
              </div>
            </div>
          </div>

          <label className="block space-y-2 text-sm text-slate-600 pt-2">
            <span className="font-bold text-slate-900">Additional Comments / Feedback Notes</span>
            <textarea
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium text-slate-900 outline-none focus:border-slate-900"
              placeholder="Tell us what was clear, what was confusing, or how we can make claim updates even simpler..."
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-base font-bold text-white hover:bg-slate-800 shadow-md transition"
          >
            <Send className="h-5 w-5" />
            Submit Feedback to Database
          </button>
        </div>
      )}
    </div>
  );
}