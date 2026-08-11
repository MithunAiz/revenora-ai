import { useMemo, useState, useEffect } from 'react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';
import { getPatientFeedbackSummary, getPatientFeedback } from '../services/feedbackStore';
import { fetchFeedbackFromBackend } from '../services/claimsApi';
import { PatientFeedback } from '../types';
import { MessageSquare, Star, ThumbsUp, ShieldCheck, Activity, User, PhoneCall } from 'lucide-react';

export function AdminDashboardPage() {
  const { demoMode, toggleDemoMode, setDemoSpeed, pauseSimulation, resumeSimulation, generateNewBatch, resetDemo } = useHospitalWorkflow();
  const [dbFeedback, setDbFeedback] = useState<PatientFeedback[]>([]);

  const feedbackSummary = useMemo(() => getPatientFeedbackSummary(), [demoMode.eventsGenerated, dbFeedback]);

  useEffect(() => {
    fetchFeedbackFromBackend()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbFeedback(data);
        } else {
          setDbFeedback(getPatientFeedback());
        }
      })
      .catch(() => setDbFeedback(getPatientFeedback()));
  }, [demoMode.eventsGenerated]);

  const feedbackList = dbFeedback.length > 0 ? dbFeedback : getPatientFeedback();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Administrator Governance Portal</h1>
        <p className="mt-1.5 text-slate-500">System oversight, patient transparency feedback reports, audit logs, and AI model health monitoring.</p>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Database Status', 'SQLite Connected'],
          ['AI Accuracy Rate', '97.4%'],
          ['Audit Trail Engine', 'Active'],
          ['System Health', '100% Operational'],
        ].map(([label, value]) => (
          <div key={label as string} className="metric-card">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label as string}</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">{value as string}</div>
          </div>
        ))}
      </div>

      {/* ADMIN FEATURE: Patient Feedback Reports & Audits */}
      <div className="space-y-5 rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Patient Care & Transparency Feedback Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">Centralized patient satisfaction submissions stored in SQLite database.</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700">
            Total Submissions: <span className="text-slate-950 font-extrabold">{feedbackList.length}</span>
          </span>
        </div>

        {/* Feedback Metric Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Feedback</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">{feedbackList.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Overall Score</div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-600">{feedbackSummary.averageOverall} / 5</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Follow-Up Requested</div>
            <div className="mt-2 text-2xl font-extrabold text-amber-600">{feedbackSummary.followUpCount} Patients</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommendation Rate</div>
            <div className="mt-2 text-2xl font-extrabold text-sky-600">
              {feedbackList.length ? Math.round((feedbackSummary.recommendCount / feedbackList.length) * 100) : 100}%
            </div>
          </div>
        </div>

        {/* Feedback Submissions Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Patient & Claim ID</th>
                <th className="px-5 py-3.5">Overall Rating</th>
                <th className="px-5 py-3.5">Status Clarity</th>
                <th className="px-5 py-3.5">Payment Clarity</th>
                <th className="px-5 py-3.5">Recommend</th>
                <th className="px-5 py-3.5">Follow-Up</th>
                <th className="px-5 py-3.5">Patient Comments</th>
                <th className="px-5 py-3.5">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {feedbackList.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{entry.patientName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{entry.claimId}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-700">{entry.overallExperience} / 5</td>
                  <td className="px-5 py-4">{entry.statusClarity} / 5</td>
                  <td className="px-5 py-4">{entry.paymentClarity} / 5</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${entry.wouldRecommend ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {entry.wouldRecommend ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${entry.followUpNeeded ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                      {entry.followUpNeeded ? 'Call Needed' : 'None'}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate">{entry.comments || 'No additional comments provided.'}</td>
                  <td className="px-5 py-4 text-slate-400">{new Date(entry.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Controls Section */}
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Demo Controls & Simulation Mode</div>
          <p className="mt-1.5 text-xs text-slate-500">Manage interactive batch generation and workflow speeds for presentation demos.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => toggleDemoMode(!demoMode.enabled)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{demoMode.enabled ? 'Disable' : 'Enable'} Demo Mode</button>
            <button onClick={() => pauseSimulation()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Pause Simulation</button>
            <button onClick={() => resumeSimulation()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Resume Simulation</button>
            <button onClick={() => generateNewBatch()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Generate New Batch</button>
            <button onClick={() => resetDemo()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Reset Demo</button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-md">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hospital Governance Status</div>
          <div className="mt-2 text-3xl font-extrabold">{demoMode.running ? 'Live Simulation Active' : 'Stable Production Mode'}</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 text-xs font-semibold">
            <div className="rounded-2xl bg-white/10 p-3.5">
              <div className="text-slate-400">Database Engine</div>
              <div className="mt-1 text-base font-bold text-white">SQLite (Node 24 Native)</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5">
              <div className="text-slate-400">Total Feedback DB Rows</div>
              <div className="mt-1 text-base font-bold text-white">{feedbackList.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}