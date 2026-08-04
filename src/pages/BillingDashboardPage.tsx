import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3, DollarSign, ShieldAlert, TrendingUp, XCircle } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

const trendData = [72, 76, 74, 80, 83, 86, 90, 92, 94];
const denialReasons = [
  ['Missing documentation', '36%'],
  ['Coding mismatch', '24%'],
  ['Coverage policy', '18%'],
  ['Duplicate billing', '11%'],
];

export function BillingDashboardPage() {
  const navigate = useNavigate();
  const { metrics, notifications, claims, activityFeed, jumpToHighRiskClaim, generateScenario } = useHospitalWorkflow();
  const topClaim = jumpToHighRiskClaim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Billing Staff Dashboard</h1>
        <p className="mt-2 text-slate-500">Monitor validation outcomes, approval trends, denial risks, and prioritized work queues.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ['Today\'s Claims', metrics.todaysClaims],
          ['Pending Validation', metrics.pendingValidation],
          ['Approved Claims', metrics.approvedClaims],
          ['Rejected Claims', metrics.rejectedClaims],
          ['Average Claim Health', `${metrics.averageClaimHealth}%`],
          ['Average Denial Risk', `${metrics.averageDenialRisk}%`],
        ].map(([label, value]) => (
          <div key={label as string} className="metric-card">
            <div className="text-sm text-slate-500">{label as string}</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">{value as string | number}</div>
            <div className="mt-2 text-xs font-medium text-emerald-600">Live sync</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-title">Approval trend</div>
              <div className="section-subtitle">Rolling validation success across the last nine cycles.</div>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-8 flex h-64 items-end gap-3">
            {trendData.map((value, index) => (
              <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end">
                  <div className="w-full rounded-t-2xl bg-gradient-to-t from-medical-blue to-cyan-300" style={{ height: `${value}%` }} />
                </div>
                <span className="text-xs text-slate-400">W{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Denial causes</div>
          <div className="mt-5 space-y-4">
            {denialReasons.map(([reason, percent]) => (
              <div key={reason}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{reason}</span>
                  <span className="font-medium text-slate-900">{percent}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-medical-blue" style={{ width: percent }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Approved', CheckCircle2, '189'],
              ['Pending', Clock3, '36'],
              ['Rejected', XCircle, '23'],
              ['Risk', ShieldAlert, '74'],
            ].map(([label, Icon, value]) => (
              <div key={label as string} className="rounded-2xl bg-slate-50 p-4">
                <Icon className="h-5 w-5 text-medical-blue" />
                <div className="mt-4 text-2xl font-semibold">{value as string}</div>
                <div className="text-sm text-slate-500">{label as string}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="section-title">Recent activity</div>
          <div className="mt-5 space-y-4">
            {activityFeed.slice(0, 5).map((item) => (
              <div key={`${item.timestamp}-${item.action}`} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-medical-emerald" />
                <div>
                  <div className="font-medium">{item.action}</div>
                  <div className="text-sm text-slate-500">{item.detail}</div>
                </div>
                <div className="ml-auto text-xs text-slate-400">{item.timestamp}</div>
              </div>
            ))}
            {notifications.slice(0, 3).map((item) => (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-medical-emerald" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-slate-500">{item.message}</div>
                </div>
                <div className="ml-auto text-xs text-slate-400">{item.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-premium">
          <div className="text-sm text-slate-300">Priority alerts</div>
          <div className="mt-3 text-2xl font-semibold">{topClaim ? `${topClaim.claimId} needs same-day review` : 'No urgent claims right now'}</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">The AI layer is continuously synchronizing claim health, denial risk, and submission readiness across the workflow.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => navigate('/billing/claims')} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90">Open review queue</button>
            <button onClick={() => generateScenario('missingDocumentation')} className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Generate issue</button>
          </div>
        </div>
      </div>
    </div>
  );
}