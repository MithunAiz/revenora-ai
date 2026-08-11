import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ClipboardList, FileText, Layers3, Microscope, RotateCcw, Send, ShieldCheck, Clock, UserCheck, Activity, ChevronRight, Lock } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';
import { resubmitClaimApi } from '../services/claimsApi';

const TRACKING_STAGES = [
  { key: 'Draft', label: 'Claim Created' },
  { key: 'AI Validation Started', label: 'AI Pre-Validation' },
  { key: 'Ready for Submission', label: 'Ready for Submission' },
  { key: 'Submitted', label: 'Submitted to Insurance' },
  { key: 'Under Insurance Review', label: 'Insurance Adjudication' },
  { key: 'Approved', label: 'Approved / Rejected' },
  { key: 'Paid', label: 'Reimbursed & Paid' },
];

export function ClaimDetailsPage() {
  const { claimId } = useParams();
  const { getClaimById, runAiReview, applySuggestion, ignoreSuggestion, markReadyForSubmission, submitClaim, manualEdit, validationPipeline } = useHospitalWorkflow();
  const claim = getClaimById(claimId ?? '') ?? getClaimById('CLM-24081');
  const [activeDocument, setActiveDocument] = useState(claim?.documents[0]?.type ?? 'Doctor Notes');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');

  const selectedDocument = useMemo(() => claim?.documents.find((document) => document.type === activeDocument) ?? claim?.documents[0], [activeDocument, claim]);

  const handleInitialSubmit = async () => {
    if (!claim || isSubmittingClaim) return;
    setIsSubmittingClaim(true);
    try {
      await submitClaim(claim.claimId);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleResubmit = async () => {
    if (!claim || isResubmitting) return;
    setIsResubmitting(true);
    try {
      await resubmitClaimApi(claim.claimId, { notes: correctionNote || 'Applied AI Denial corrections and resubmitted claim.' });
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Resubmission failed');
    } finally {
      setIsResubmitting(false);
    }
  };

  if (!claim) {
    return null;
  }

  const aiMetrics = [
    ['Claim Health', claim.aiReview.claimHealth],
    ['Documentation', claim.aiReview.documentationScore],
    ['Coding', claim.aiReview.codingScore],
    ['Compliance', claim.aiReview.complianceScore],
    ['Medical Necessity', claim.aiReview.medicalNecessityScore],
  ];

  const getCurrentStepIndex = () => {
    const isPaid = claim.status === 'Paid' || claim.submissionStatus === 'Paid' || claim.stage === 'Paid';
    if (isPaid) return 6;
    const isApprovedOrRejected = claim.status === 'Approved' || claim.status === 'Rejected' || claim.submissionStatus === 'Approved' || claim.submissionStatus === 'Rejected';
    if (isApprovedOrRejected) return 5;
    const isUnderReview = claim.status === 'Under Insurance Review' || claim.submissionStatus === 'Under Insurance Review';
    if (isUnderReview) return 4;
    const isSubmitted = claim.status === 'Submitted' || claim.submissionStatus === 'Submitted';
    if (isSubmitted) return 3;
    const isReady = claim.status === 'Ready to Submit' || claim.submissionStatus === 'Ready for Submission' || claim.stage === 'Ready for Submission';
    if (isReady) return 2;
    return 1;
  };

  const currentStepIdx = getCurrentStepIndex();
  const isSubmittedOrInReview = claim.status === 'Submitted' || claim.status === 'Under Insurance Review' || claim.submissionStatus === 'Submitted' || claim.submissionStatus === 'Under Insurance Review';
  const isRejected = claim.status === 'Rejected' || claim.submissionStatus === 'Rejected';
  const isApprovedOrPaid = claim.status === 'Approved' || claim.status === 'Paid' || claim.submissionStatus === 'Paid' || claim.submissionStatus === 'Approved' || claim.stage === 'Paid';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Claim Review Workspace</h1>
            <span className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-mono font-bold text-white">{claim.claimId}</span>
          </div>
          <p className="mt-1 text-slate-500">Centralized clinical documentation, AI findings, correction entry, and complete lifecycle claim tracking.</p>
        </div>

        {/* Top Header Action Buttons with Anti-Spam Control & Status Guards */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isApprovedOrPaid ? (
            <div className="flex items-center gap-2.5 rounded-full border-2 border-emerald-400 bg-emerald-100 px-5 py-2.5 text-sm font-extrabold text-emerald-900 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <span>Claim Reimbursed & Settled</span>
            </div>
          ) : isSubmittedOrInReview ? (
            <div className="flex items-center gap-2.5 rounded-full border border-slate-300 bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed shadow-inner">
              <Clock className="h-4 w-4 animate-spin text-slate-500" />
              <span>Submitted & Under Payer Review...</span>
            </div>
          ) : isRejected ? (
            <div className="flex items-center gap-2 rounded-full border border-red-300 bg-red-100 px-5 py-2.5 text-sm font-bold text-red-800 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-red-700" />
              <span>Claim Rejected — Use AI Resubmission Panel Below</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => runAiReview(claim.claimId)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Run AI Review
              </button>
              <button
                type="button"
                onClick={() => markReadyForSubmission(claim.claimId)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Ready for Submission
              </button>
              <button
                type="button"
                onClick={handleInitialSubmit}
                disabled={isSubmittingClaim}
                className="rounded-full border border-emerald-300 bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
              >
                {isSubmittingClaim ? 'Submitting to Insurance...' : 'Submit Claim'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Banner for Reimbursement or AI Denial Workspace */}
      {isRejected ? (
        <div className="rounded-3xl border-2 border-red-300 bg-gradient-to-br from-red-50 via-white to-red-50/50 p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-red-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-red-950">AI Denial Intelligence & Billing Correction Workspace</div>
                <div className="text-xs font-semibold text-red-700">Insurance Payer Decision: CLAIM REJECTED</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-300">Confidence {claim.denialIntelligence?.confidence || 98}%</span>
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">Action Required</span>
            </div>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl bg-white p-5 border border-red-200 shadow-sm text-sm">
              <p><span className="font-bold text-slate-900">Denial Root Cause:</span> <span className="text-red-700 font-semibold">{claim.denialIntelligence?.rootCause || 'Missing Radiology Report RAD-409 for CPT 47563'}</span></p>
              <p><span className="font-bold text-slate-900">Evidence Extracted:</span> {claim.denialIntelligence?.evidence || 'Intraoperative cholangiogram documented in CPT 47563 but radiology report missing from packet.'}</p>
              <p><span className="font-bold text-slate-900">Suggested Fix:</span> {claim.denialIntelligence?.suggestedFix || 'Attach Radiology Report RAD-409 and append modifier 22.'}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-red-200 shadow-sm space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">Staff Correction Notes & Attachment Upload</div>
              <textarea
                rows={3}
                placeholder="Type resolution details, upload doc IDs, or describe code changes (e.g. Attached RAD-409 report and appended modifier 22)..."
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
              <button
                type="button"
                onClick={handleResubmit}
                disabled={isResubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 shadow-md transition disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                {isResubmitting ? 'Processing Resubmission to TPA...' : 'Apply Correction & Resubmit Claim to Insurance'}
              </button>
            </div>
          </div>
        </div>
      ) : isApprovedOrPaid ? (
        <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-6 shadow-md">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-950">Reimbursement & Payment Settlement Summary</div>
                <div className="text-xs font-semibold text-emerald-700">Adjudication Status: {claim.status === 'Paid' || claim.stage === 'Paid' ? 'REIMBURSED & PAID' : 'APPROVED FOR PAYMENT'}</div>
              </div>
            </div>
            <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white uppercase tracking-wider">Cashless Settled</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 border border-emerald-200 text-center shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Payer Coverage</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-600">₹{Number(claim.billing?.insuranceCoverage || claim.amount * 0.9).toLocaleString()}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-emerald-200 text-center shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Co-Pay / Responsibility</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-800">₹{Number(claim.billing?.patientResponsibility || claim.amount * 0.1).toLocaleString()}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-emerald-200 text-center shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insurance Payer / TPA</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{claim.insurance}</div>
              <div className="text-xs font-semibold text-slate-500">Ref: TPA-{claim.claimId.replace('CLM-', '')}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Balanced 2-Column Main Section */}
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Left Column: Patient Context & AI Validation Scores */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="section-title">Patient Summary</div>
            <div className="mt-4 space-y-2.5 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Patient ID:</span> {claim.patientId}</p>
              <p><span className="font-semibold text-slate-900">Name:</span> {claim.patient}</p>
              <p><span className="font-semibold text-slate-900">Age / Gender:</span> {claim.age} yrs / {claim.gender}</p>
              <p><span className="font-semibold text-slate-900">Admission Date:</span> {claim.admissionDate}</p>
              <p><span className="font-semibold text-slate-900">Discharge Date:</span> {claim.dischargeDate}</p>
              <p><span className="font-semibold text-slate-900">Primary Physician:</span> {claim.primaryPhysician}</p>
              <p><span className="font-semibold text-slate-900">Insurance Provider:</span> {claim.insurance}</p>
              <p><span className="font-semibold text-slate-900">Diagnosis:</span> {claim.diagnosis}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-title">AI Pre-Validation Scores</div>
                <div className="section-subtitle">Internal quality assurance metrics.</div>
              </div>
              <Microscope className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 space-y-3">
              {aiMetrics.map(([label, value]) => (
                <div key={label as string} className="rounded-2xl bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">{label as string}</span>
                    <span className="font-bold text-slate-900">{value}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Column: Docs + Side-by-Side Coding & Billing Panels */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="section-title">Clinical Documentation Viewer</div>
                <div className="section-subtitle">Switch between chart notes without leaving workspace.</div>
              </div>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {claim.documents.map((document) => (
                <button
                  key={document.type}
                  type="button"
                  onClick={() => setActiveDocument(document.type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    selectedDocument?.type === document.type ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {document.type}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedDocument?.type}</span>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Updated {selectedDocument?.updatedAt}</span>
              </div>
              <p>{selectedDocument?.content}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-title">Medical Coding Panel</div>
                  <div className="section-subtitle">ICD / CPT codes & modifiers.</div>
                </div>
                <Layers3 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <label className="block rounded-2xl bg-slate-50 p-3">
                  <div className="mb-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">ICD-10 Codes</div>
                  <input defaultValue={claim.coding?.icdCodes?.join(', ') || 'A41.9'} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
                </label>
                <label className="block rounded-2xl bg-slate-50 p-3">
                  <div className="mb-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">CPT Procedure Codes</div>
                  <input defaultValue={claim.coding?.procedureCodes?.join(', ') || '99291'} className="w-full bg-transparent font-bold text-slate-900 outline-none" />
                </label>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="mb-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">Modifiers</div>
                  <div className="font-bold text-slate-900">{claim.coding?.modifiers?.join(', ') || 'None'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-title">Billing Summary</div>
                  <div className="section-subtitle">Hospital charges breakdown.</div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {[
                  ['Hospital Charges', claim.billing?.hospitalCharges || claim.amount * 0.6],
                  ['Department Charges', claim.billing?.departmentCharges || claim.amount * 0.25],
                  ['Procedure Charges', claim.billing?.procedureCharges || claim.amount * 0.15],
                  ['Insurance Coverage', claim.billing?.insuranceCoverage || claim.amount * 0.9],
                  ['Patient Co-Pay', claim.billing?.patientResponsibility || claim.amount * 0.1],
                  ['Grand Total', claim.billing?.grandTotal || claim.amount],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2">
                    <span className="text-slate-600 text-xs font-semibold">{label as string}</span>
                    <span className="font-bold text-slate-900 text-xs">₹{Number(value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Full-Width Extended Claim Tracking Engine */}
      <div className="w-full rounded-3xl border-2 border-slate-300 bg-white p-8 shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-sky-600" />
              <h2 className="text-2xl font-extrabold text-slate-950">Claim Tracking & Lifecycle Pipeline</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Real-time status transitions managed by backend state machine from creation to final reimbursement.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
              Current Stage: <span className="font-extrabold text-sky-600">{claim.currentStage}</span>
            </div>
            <div className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
              Status: <span>{claim.status}</span>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Nodes */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 pt-4">
          {TRACKING_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={stage.key} className="flex flex-1 min-w-[120px] flex-col items-center text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-xs shadow-md transition ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className={`mt-3 text-xs font-bold ${isCurrent ? 'text-sky-700' : isCompleted ? 'text-emerald-800' : 'text-slate-400'}`}>
                  {stage.label}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {isCompleted ? 'Completed' : isCurrent ? 'Active Now' : 'Pending'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Log Stream */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 border border-slate-200">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Complete Activity Audit Stream</div>
          <div className="space-y-2.5 text-sm">
            {claim.activity.map((act, i) => (
              <div key={`${act.timestamp}-${i}`} className="flex flex-wrap items-center justify-between rounded-xl bg-white p-3 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700">{act.timestamp}</span>
                  <span className="font-bold text-slate-900">{act.actor}:</span>
                  <span className="font-semibold text-slate-800">{act.action}</span>
                </div>
                <span className="text-xs text-slate-500">{act.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}