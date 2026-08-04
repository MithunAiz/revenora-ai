import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ClipboardList, FileText, Layers3, Microscope, RotateCcw, Send } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

export function ClaimDetailsPage() {
  const { claimId } = useParams();
  const { getClaimById, runAiReview, applySuggestion, ignoreSuggestion, markReadyForSubmission, submitClaim, manualEdit, validationPipeline } = useHospitalWorkflow();
  const claim = getClaimById(claimId ?? '') ?? getClaimById('CLM-24081');
  const [activeDocument, setActiveDocument] = useState(claim?.documents[0]?.type ?? 'Doctor Notes');

  const selectedDocument = useMemo(() => claim?.documents.find((document) => document.type === activeDocument) ?? claim?.documents[0], [activeDocument, claim]);

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

  const pipelineStatus = validationPipeline.map((stage, index) => ({
    stage,
    tone: index <= 1 ? 'bg-emerald-50 text-emerald-700' : index === 2 || index === 3 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700',
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Claim Review Workspace</h1>
          <p className="mt-2 text-slate-500">One workspace for clinical evidence, medical coding, AI findings, correction workflow, and submission readiness.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => runAiReview(claim.claimId)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Run AI Review</button>
          <button type="button" onClick={() => markReadyForSubmission(claim.claimId)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Ready for Submission</button>
          <button type="button" onClick={() => submitClaim(claim.claimId)} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Submit Claim</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr_0.92fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="section-title">Patient Summary</div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Patient ID:</span> {claim.patientId}</p>
              <p><span className="font-semibold text-slate-900">Name:</span> {claim.patient}</p>
              <p><span className="font-semibold text-slate-900">Age:</span> {claim.age}</p>
              <p><span className="font-semibold text-slate-900">Gender:</span> {claim.gender}</p>
              <p><span className="font-semibold text-slate-900">Admission:</span> {claim.admissionDate}</p>
              <p><span className="font-semibold text-slate-900">Discharge:</span> {claim.dischargeDate}</p>
              <p><span className="font-semibold text-slate-900">Primary Physician:</span> {claim.primaryPhysician}</p>
              <p><span className="font-semibold text-slate-900">Insurance:</span> {claim.insurance}</p>
              <p><span className="font-semibold text-slate-900">Policy / Coverage:</span> Standard commercial plan / Active</p>
              <p><span className="font-semibold text-slate-900">Diagnosis:</span> {claim.diagnosis}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="section-title">Claim Timeline</div>
            <div className="mt-5 space-y-3">
              {claim.timeline.map((entry) => (
                <div key={`${entry.stage}-${entry.timestamp}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span>{entry.stage}</span>
                  <span className="text-slate-400">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="section-title">Clinical Documentation Viewer</div>
                <div className="section-subtitle">Switch between realistic chart documents without leaving the claim.</div>
              </div>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {claim.documents.map((document) => (
                <button key={document.type} type="button" onClick={() => setActiveDocument(document.type)} className={`rounded-full px-3 py-2 text-sm font-medium transition ${selectedDocument?.type === document.type ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {document.type}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-slate-900">{selectedDocument?.type}</span>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Updated {selectedDocument?.updatedAt}</span>
              </div>
              <p>{selectedDocument?.content}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-title">Medical Coding Panel</div>
                  <div className="section-subtitle">Edit codes or apply AI suggestions.</div>
                </div>
                <Layers3 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-5 space-y-4 text-sm">
                <label className="block rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">ICD Codes</div>
                  <input defaultValue={claim.coding.icdCodes.join(', ')} onBlur={(event) => manualEdit(claim.claimId, 'status', claim.status)} className="w-full bg-transparent text-slate-900 outline-none" />
                </label>
                <label className="block rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">Procedure Codes</div>
                  <input defaultValue={claim.coding.procedureCodes.join(', ')} className="w-full bg-transparent text-slate-900 outline-none" />
                </label>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">Modifiers</div>
                  <div>{claim.coding.modifiers.join(', ')}</div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">Suspicious code match detected for one procedure line. Review the operative note before submission.</div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-title">Billing Summary</div>
                  <div className="section-subtitle">Charges, coverage, and patient responsibility are synchronized with claim review.</div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  ['Hospital Charges', claim.billing.hospitalCharges],
                  ['Department Charges', claim.billing.departmentCharges],
                  ['Procedure Charges', claim.billing.procedureCharges],
                  ['Insurance Coverage', claim.billing.insuranceCoverage],
                  ['Patient Responsibility', claim.billing.patientResponsibility],
                  ['Discounts', claim.billing.discounts],
                  ['Grand Total', claim.billing.grandTotal],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-600">{label as string}</span>
                    <span className="font-semibold text-slate-900">${Number(value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-title">AI Claim Review</div>
                <div className="section-subtitle">Explainable scores and recommendations.</div>
              </div>
              <Microscope className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 space-y-3">
              {aiMetrics.map(([label, value]) => (
                <div key={label as string} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label as string}</span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-medical-blue" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {claim.aiReview.issues.map((issue) => (
                <details key={issue.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">{issue.title}</summary>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Issue:</span> {issue.explanation}</p>
                    <p><span className="font-semibold text-slate-900">Why it matters:</span> {issue.whyItMatters}</p>
                    <p><span className="font-semibold text-slate-900">Evidence:</span> {issue.evidence}</p>
                    <p><span className="font-semibold text-slate-900">Recommended fix:</span> {issue.recommendedFix}</p>
                    <p><span className="font-semibold text-slate-900">Confidence:</span> {issue.confidence}%</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button type="button" onClick={() => applySuggestion(claim.claimId, issue.title)} className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Accept Suggestion</button>
                      <button type="button" onClick={() => ignoreSuggestion(claim.claimId, issue.title)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">Ignore</button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="section-title">Validation Pipeline</div>
            <div className="mt-5 space-y-3">
              {pipelineStatus.map((item) => (
                <div key={item.stage} className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${item.tone}`}>
                  <span>{item.stage}</span>
                  <span>Active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="section-title">Claim Tracking</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Current Stage:</span> {claim.currentStage}</p>
              <p><span className="font-semibold text-slate-900">Submission Status:</span> {claim.submissionStatus}</p>
              <p><span className="font-semibold text-slate-900">Assigned User:</span> {claim.assignedStaff}</p>
              <p><span className="font-semibold text-slate-900">Last Activity:</span> {claim.activity[0]?.timestamp}</p>
              <p><span className="font-semibold text-slate-900">Expected Completion:</span> {claim.expectedCompletion}</p>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
                  <span>Progress</span>
                  <span>{claim.claimHealth}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-medical-emerald" style={{ width: `${claim.claimHealth}%` }} />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Timeline Snapshot</div>
                <div className="mt-2 space-y-2 text-slate-600">
                  {claim.activity.slice(0, 3).map((activity) => (
                    <div key={`${activity.timestamp}-${activity.action}`} className="flex items-center justify-between gap-3">
                      <span>{activity.timestamp}</span>
                      <span className="text-right">{activity.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}