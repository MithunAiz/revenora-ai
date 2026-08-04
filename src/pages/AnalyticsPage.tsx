import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

const barClass = 'rounded-t-2xl bg-gradient-to-t from-medical-blue to-cyan-300';

export function AnalyticsPage() {
  const { analyticsSummary, claims } = useHospitalWorkflow();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Analytics</h1>
        <p className="mt-2 text-slate-500">Interactive reporting surfaces for approval rates, denial causes, and processing efficiency.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Approval %', `${analyticsSummary.approvalRate}%`],
          ['Denial %', `${(100 - analyticsSummary.approvalRate).toFixed(1)}%`],
          ['AI Accuracy', `${analyticsSummary.aiDetectionAccuracy}%`],
          ['Validation Success', `${analyticsSummary.validationSuccessRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="metric-card">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Claim Health Distribution</div>
          <div className="mt-6 grid grid-cols-4 items-end gap-3 h-60">
            {analyticsSummary.claimHealthDistribution.map((bin) => (
              <div key={bin.label} className="flex h-full flex-col items-center justify-end gap-2">
                <div className={barClass} style={{ height: `${bin.value}%`, width: '100%' }} />
                <span className="text-xs text-slate-400">{bin.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Top Denial Reasons</div>
          <div className="mt-5 space-y-4">
            {analyticsSummary.topDenialReasons.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-medical-blue" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="section-title">Denial Trend</div>
          <div className="mt-6 flex h-52 items-end gap-3">
            {analyticsSummary.denialTrend.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-2xl bg-medical-red/80" style={{ height: `${value * 7}%` }} />
                <span className="text-xs text-slate-400">P{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ['Claims Reviewed', claims.length],
              ['Coding Errors', analyticsSummary.codingErrors.length],
              ['Departments Tracked', analyticsSummary.departmentRisk.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">{label as string}</div>
                <div className="mt-2 text-2xl font-semibold">{value as number}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Department Risk</div>
          <div className="mt-5 space-y-4">
            {analyticsSummary.departmentRisk.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}