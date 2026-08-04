import { useMemo, useState } from 'react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';
import { getPatientFeedback, submitPatientFeedback } from '../services/feedbackStore';

const scaleOptions = [1, 2, 3, 4, 5];

export function PatientFeedbackPage() {
  const { claims } = useHospitalWorkflow();
  const claim = claims[0];
  const [patientName, setPatientName] = useState(claim.patient);
  const [claimId, setClaimId] = useState(claim.claimId);
  const [overallExperience, setOverallExperience] = useState(4);
  const [statusClarity, setStatusClarity] = useState(4);
  const [paymentClarity, setPaymentClarity] = useState(4);
  const [supportHelpfulness, setSupportHelpfulness] = useState(5);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const recentFeedback = useMemo(() => getPatientFeedback().slice(0, 5), [submitted]);

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
    setComments('');
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Share Feedback</h1>
        <p className="mt-2 text-slate-500">Tell us how clear the claim updates were and how the experience felt from your side.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Your Experience</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Patient name</span>
              <input value={patientName} onChange={(event) => setPatientName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-medical-blue" />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Claim number</span>
              <select value={claimId} onChange={(event) => setClaimId(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-medical-blue">
                {claims.map((item) => <option key={item.claimId} value={item.claimId}>{item.claimId}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-6 space-y-5">
            {[
              ['How would you rate your overall experience?', overallExperience, setOverallExperience],
              ['How clear were the claim status updates?', statusClarity, setStatusClarity],
              ['How clear was the payment summary?', paymentClarity, setPaymentClarity],
              ['How helpful was the support team?', supportHelpfulness, setSupportHelpfulness],
            ].map(([label, value, setter]) => (
              <div key={label as string} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-slate-900">{label as string}</div>
                  <div className="text-sm font-semibold text-slate-700">{value as number}/5</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scaleOptions.map((option) => (
                    <button key={option} type="button" onClick={() => (setter as (value: number) => void)(option)} className={`h-10 w-10 rounded-full text-sm font-semibold ${value === option ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Would you recommend us?</span>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => setWouldRecommend(true)} className={`rounded-full px-4 py-2 font-semibold ${wouldRecommend ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600'}`}>Yes</button>
                <button type="button" onClick={() => setWouldRecommend(false)} className={`rounded-full px-4 py-2 font-semibold ${!wouldRecommend ? 'bg-red-50 text-red-700' : 'bg-white text-slate-600'}`}>No</button>
              </div>
            </label>
            <label className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Do you need follow-up?</span>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => setFollowUpNeeded(false)} className={`rounded-full px-4 py-2 font-semibold ${!followUpNeeded ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600'}`}>No</button>
                <button type="button" onClick={() => setFollowUpNeeded(true)} className={`rounded-full px-4 py-2 font-semibold ${followUpNeeded ? 'bg-amber-50 text-amber-700' : 'bg-white text-slate-600'}`}>Yes</button>
              </div>
            </label>
          </div>

          <label className="mt-6 block space-y-2 text-sm text-slate-600">
            <span className="font-medium text-slate-900">Anything else we should know?</span>
            <textarea value={comments} onChange={(event) => setComments(event.target.value)} rows={5} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-medical-blue" placeholder="Tell us what was clear, what was confusing, or where we can improve." />
          </label>

          <button type="button" onClick={handleSubmit} className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Submit Feedback
          </button>

          {submitted ? <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">Thanks. Your feedback was saved and is available to the hospital team.</div> : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Recent Feedback</div>
          <div className="mt-5 space-y-4">
            {recentFeedback.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-slate-900">{entry.patientName}</div>
                  <div className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="mt-2">Claim {entry.claimId}</div>
                <div className="mt-2 text-slate-700">Overall experience: {entry.overallExperience}/5</div>
                <div className="mt-1 text-slate-700">Status clarity: {entry.statusClarity}/5</div>
                <div className="mt-1 text-slate-700">Payment clarity: {entry.paymentClarity}/5</div>
                <div className="mt-1 text-slate-700">Support helpfulness: {entry.supportHelpfulness}/5</div>
                <div className="mt-2 text-slate-700">{entry.comments}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}