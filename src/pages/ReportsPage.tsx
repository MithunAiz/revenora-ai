import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

export function ReportsPage() {
  const { metrics, analyticsSummary } = useHospitalWorkflow();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Reports</h1>
        <p className="mt-2 text-slate-500">Operational and financial reporting snapshots for revenue cycle teams.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Monthly report summary</div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ['Claims processed', metrics.todaysClaims],
            ['Rejected claims', metrics.rejectedClaims],
            ['Recovered revenue', `$${Math.round(metrics.revenueProtected / 1000)}K`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">{label}</div>
              <div className="mt-2 text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Validation Success</div><div className="mt-2 text-2xl font-semibold">{analyticsSummary.validationSuccessRate}%</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">AI Accuracy</div><div className="mt-2 text-2xl font-semibold">{analyticsSummary.aiDetectionAccuracy}%</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Average Claim Health</div><div className="mt-2 text-2xl font-semibold">{metrics.averageClaimHealth}%</div></div>
        </div>
      </div>
    </div>
  );
}