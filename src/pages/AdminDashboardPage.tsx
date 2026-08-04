import { useMemo } from 'react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';
import { getPatientFeedbackSummary } from '../services/feedbackStore';

export function AdminDashboardPage() {
  const { demoMode, toggleDemoMode, setDemoSpeed, pauseSimulation, resumeSimulation, generateNewBatch, resetDemo } = useHospitalWorkflow();
  const feedbackSummary = useMemo(() => getPatientFeedbackSummary(), [demoMode.eventsGenerated]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Administrator Portal</h1>
        <p className="mt-2 text-slate-500">Hospital governance, access control, audit logs, system health, and AI model status.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['System Health', 'Stable'],
          ['AI Accuracy', '96.4%'],
          ['Validation Queue', '12'],
          ['Audit Logs', 'Live'],
        ].map(([label, value]) => (
          <div key={label as string} className="metric-card">
            <div className="text-sm text-slate-500">{label as string}</div>
            <div className="mt-3 text-2xl font-semibold">{value as string}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Feedback submissions', feedbackSummary.total],
          ['Average satisfaction', `${feedbackSummary.averageOverall}/5`],
          ['Needs follow-up', feedbackSummary.followUpCount],
          ['Recommend rate', `${feedbackSummary.total ? Math.round((feedbackSummary.recommendCount / feedbackSummary.total) * 100) : 0}%`],
        ].map(([label, value]) => (
          <div key={label as string} className="metric-card">
            <div className="text-sm text-slate-500">{label as string}</div>
            <div className="mt-3 text-2xl font-semibold">{value as string | number}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Demo Mode</div>
          <p className="mt-2 text-sm text-slate-500">Enable the hospital simulation engine for presentations and hackathon demos.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => toggleDemoMode(!demoMode.enabled)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{demoMode.enabled ? 'Disable' : 'Enable'} Demo Mode</button>
            <button onClick={() => pauseSimulation()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Pause Simulation</button>
            <button onClick={() => resumeSimulation()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Resume Simulation</button>
            <button onClick={() => generateNewBatch()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Generate New Batch</button>
            <button onClick={() => resetDemo()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Reset Demo</button>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {['Normal', 'Fast', 'Presentation', 'Custom'].map((speed) => (
              <button key={speed} onClick={() => setDemoSpeed(speed as any)} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${demoMode.speed === speed ? 'bg-medical-blue text-white' : 'bg-slate-50 text-slate-600'}`}>{speed}</button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-premium">
          <div className="text-sm text-slate-300">Simulation Status</div>
          <div className="mt-2 text-3xl font-semibold">{demoMode.running ? 'Running' : 'Paused'}</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Events Generated', demoMode.eventsGenerated],
              ['Claims Processed', demoMode.claimsProcessed],
              ['Claims Approved', demoMode.claimsApproved],
              ['Claims Corrected', demoMode.claimsCorrected],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-300">{label as string}</div>
                <div className="mt-2 text-2xl font-semibold">{value as number}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-slate-200">Revenue protected during demo: ${demoMode.revenueProtected.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}