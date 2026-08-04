import { useNavigate } from 'react-router-dom';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications } = useHospitalWorkflow();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Notifications</h1>
        <p className="mt-2 text-slate-500">Claim approvals, rejections, AI suggestions, and compliance alerts.</p>
      </div>
      <div className="space-y-4">
        {notifications.map((item) => (
          <button key={item.title + item.timestamp} type="button" onClick={() => item.claimId && navigate(`/billing/claims/${item.claimId}`)} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{item.title}</div>
              <div className="text-xs text-slate-400">{item.timestamp}</div>
            </div>
            <p className="mt-2 text-sm text-slate-500">{item.message}</p>
          </button>
        ))}
      </div>
    </div>
  );
}