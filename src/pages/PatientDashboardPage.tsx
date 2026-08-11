import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, User, FileText, Bell, Sparkles } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

const PATIENT_STAGES = [
  { key: 'Draft', label: '1. Claim Filed' },
  { key: 'AI Validation Started', label: '2. Hospital Verification' },
  { key: 'Ready for Submission', label: '3. Pre-Auth Prepared' },
  { key: 'Submitted', label: '4. Sent to Insurance' },
  { key: 'Under Insurance Review', label: '5. Payer Review' },
  { key: 'Approved', label: '6. Approved & Settled' },
];

export function PatientDashboardPage() {
  const { claims } = useHospitalWorkflow();
  
  // Patient Credentials / Account Selection
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.claimId || 'CLM-24084');

  const claim = useMemo(() => {
    return claims.find((c) => c.claimId === selectedClaimId) || claims[0];
  }, [claims, selectedClaimId]);

  if (!claim) return null;

  const isApproved = claim.status === 'Approved' || claim.status === 'Paid' || claim.submissionStatus === 'Approved' || claim.submissionStatus === 'Paid' || claim.stage === 'Paid';
  const isRejected = claim.status === 'Rejected' || claim.submissionStatus === 'Rejected';

  const getPatientStepIndex = () => {
    if (isApproved) return 5;
    if (isRejected) return 4;
    if (claim.status === 'Under Insurance Review' || claim.submissionStatus === 'Under Insurance Review') return 4;
    if (claim.status === 'Submitted' || claim.submissionStatus === 'Submitted') return 3;
    if (claim.status === 'Ready to Submit' || claim.submissionStatus === 'Ready for Submission') return 2;
    return 1;
  };

  const activeStepIdx = getPatientStepIndex();

  return (
    <div className="space-y-6">
      {/* Header Bar with Patient Credential Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Patient Care & Claim Portal</h1>
          <p className="mt-1 text-slate-500">Track your hospital claim status, cashless insurance approval, and payment summaries in plain language.</p>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Logged-in Patient Account</div>
            <select
              value={selectedClaimId}
              onChange={(e) => setSelectedClaimId(e.target.value)}
              className="bg-transparent font-bold text-sm text-slate-900 outline-none cursor-pointer"
            >
              {claims.map((item) => (
                <option key={item.claimId} value={item.claimId}>
                  {item.patient} ({item.claimId} - {item.insurance})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LIVE APPROVAL / STATUS NOTIFICATION BANNER */}
      {isApproved ? (
        <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Bell className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-emerald-950">🎉 Claim Approved & Settled!</span>
                  <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white">Live Notification</span>
                </div>
                <p className="mt-1 text-sm font-medium text-emerald-900">
                  Great news, <span className="font-bold">{claim.patient}</span>! Your cashless insurance claim <span className="font-bold">{claim.claimId}</span> (₹{Number(claim.billing?.insuranceCoverage || claim.amount * 0.9).toLocaleString()}) has been fully approved by <span className="font-bold">{claim.insurance}</span>.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm">
              ₹0 Upfront Out-of-Pocket
            </div>
          </div>
        </div>
      ) : isRejected ? (
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/70 p-6 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div>
              <div className="text-lg font-bold text-amber-950">Hospital Reviewing Claim Details</div>
              <p className="text-sm text-amber-800">Your hospital billing care team is currently adding updated documentation to your claim for automatic insurance re-submission.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-sky-200 bg-sky-50/60 p-5 shadow-xs">
          <div className="flex items-center gap-3 text-sky-900">
            <Clock className="h-5 w-5 text-sky-600" />
            <div className="text-sm font-semibold">Your claim is active and currently undergoing quality verification by {claim.department}.</div>
          </div>
        </div>
      )}

      {/* PATIENT AUTHORIZED CLAIM TRACKING PIPELINE (Patient-Friendly, Authorized Info Only) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Claim Progression</h2>
            <p className="text-xs text-slate-500 mt-0.5">Simple, authorized status milestones provided by {claim.department}.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700">
            Status: <span className="text-sky-700">{claim.status === 'Paid' ? 'Reimbursed & Paid' : claim.status}</span>
          </span>
        </div>

        {/* Patient Tracking Pipeline Nodes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {PATIENT_STAGES.map((st, idx) => {
            const isCompleted = idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;
            return (
              <div key={st.key} className={`rounded-2xl p-4 border text-center transition ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                  : isCurrent
                  ? 'border-sky-300 bg-sky-50 text-sky-950 ring-2 ring-sky-200'
                  : 'border-slate-100 bg-slate-50 text-slate-400'
              }`}>
                <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="mt-2 text-xs font-bold truncate">{st.label}</div>
                <div className="mt-0.5 text-[10px] text-slate-500">{isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Authorized Info Cards (Simple Language) */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="section-title">Claim Overview</div>
          <div className="space-y-3 text-sm text-slate-600">
            <p><span className="font-bold text-slate-900">Patient Name:</span> {claim.patient}</p>
            <p><span className="font-bold text-slate-900">Claim Reference:</span> {claim.claimId}</p>
            <p><span className="font-bold text-slate-900">Attending Doctor:</span> {claim.primaryPhysician}</p>
            <p><span className="font-bold text-slate-900">Insurance Provider:</span> {claim.insurance}</p>
            <p><span className="font-bold text-slate-900">Hospital / Facility:</span> {claim.department}</p>
            <p><span className="font-bold text-slate-900">Admission Period:</span> {claim.admissionDate} to {claim.dischargeDate}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="section-title">Payment & Coverage Summary</div>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span>Total Hospital Bill:</span>
              <span className="font-bold text-slate-900">₹{Number(claim.billing?.grandTotal || claim.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-emerald-50 p-3 text-emerald-900 font-semibold">
              <span>Approved Insurance Coverage:</span>
              <span className="font-extrabold">₹{Number(claim.billing?.insuranceCoverage || claim.amount * 0.9).toLocaleString()}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span>Estimated Patient Co-Pay:</span>
              <span className="font-bold text-slate-900">₹{Number(claim.billing?.patientResponsibility || claim.amount * 0.1).toLocaleString()}</span>
            </div>
            <Link to="/patient/feedback" className="mt-4 inline-flex items-center justify-center w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition shadow-sm">
              Share Experience Feedback
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}