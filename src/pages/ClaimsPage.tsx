import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

const statusTone: Record<string, string> = {
  Approved: 'bg-emerald-50 text-emerald-700',
  'Pending Validation': 'bg-cyan-50 text-sky-700',
  Rejected: 'bg-red-50 text-red-700',
  'Needs Review': 'bg-amber-50 text-amber-700',
  'Ready to Submit': 'bg-emerald-50 text-emerald-700',
  Submitted: 'bg-slate-100 text-slate-700',
  'Under Insurance Review': 'bg-violet-50 text-violet-700',
  Paid: 'bg-emerald-50 text-emerald-700',
};

const filters = ['All', 'High Risk', 'Ready for Submission', 'Needs Documentation', 'Coding Issues', 'Compliance Issues', 'Rejected', 'Approved', 'Pending Validation', 'Assigned to Me'] as const;

const matchesFilter = (claim: any, filter: string) => {
  switch (filter) {
    case 'High Risk':
      return claim.denialRisk >= 60;
    case 'Ready for Submission':
      return claim.submissionStatus === 'Ready for Submission';
    case 'Needs Documentation':
      return claim.aiReview.issues.some((issue: any) => /documentation|signature|summary/i.test(issue.title));
    case 'Coding Issues':
      return claim.aiReview.issues.some((issue: any) => /code|modifier|billing/i.test(issue.title));
    case 'Compliance Issues':
      return claim.aiReview.issues.some((issue: any) => /coverage|authorization|compliance/i.test(issue.title));
    case 'Rejected':
      return claim.status === 'Rejected';
    case 'Approved':
      return claim.status === 'Approved' || claim.status === 'Paid';
    case 'Pending Validation':
      return claim.status === 'Pending Validation' || claim.status === 'Needs Review';
    case 'Assigned to Me':
      return claim.assignedToMe;
    default:
      return true;
  }
};

export function ClaimsPage() {
  const navigate = useNavigate();
  const { claims } = useHospitalWorkflow();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');

  const filteredClaims = useMemo(() => claims.filter((claim) => {
    const haystack = [claim.claimId, claim.patient, claim.primaryPhysician, claim.insurance, claim.diagnosis, claim.assignedStaff, claim.department, claim.status, claim.submissionStatus, claim.currentStage].join(' ').toLowerCase();
    const searchMatch = haystack.includes(search.toLowerCase());
    return searchMatch && matchesFilter(claim, activeFilter);
  }), [claims, search, activeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Claims</h1>
          <p className="mt-2 text-slate-500">Review the claim queue with live search, validation filters, and click-through claim workspaces.</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">{filteredClaims.length} visible claims</div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[280px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims, patients, doctors, insurers, diagnoses" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter === filter ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              {['Claim ID', 'Patient', 'Provider', 'Insurance', 'Diagnosis', 'Assigned Staff', 'Health', 'Denial Risk', 'Submission Status', 'AI Review Status', 'Current Stage', 'Last Updated', 'Priority'].map((head) => (
                <th key={head} className="px-6 py-4">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClaims.map((claim) => (
              <tr key={claim.claimId} onClick={() => navigate(`/billing/claims/${claim.claimId}`)} className="cursor-pointer transition hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{claim.claimId}</td>
                <td className="px-6 py-4 text-slate-600">{claim.patient}</td>
                <td className="px-6 py-4 text-slate-600">{claim.primaryPhysician}</td>
                <td className="px-6 py-4 text-slate-600">{claim.insurance}</td>
                <td className="px-6 py-4 text-slate-600">{claim.diagnosis}</td>
                <td className="px-6 py-4 text-slate-600">{claim.assignedStaff}</td>
                <td className="px-6 py-4 text-slate-600">{claim.claimHealth}</td>
                <td className="px-6 py-4 text-slate-600">{claim.denialRisk}%</td>
                <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[claim.submissionStatus] ?? 'bg-slate-100 text-slate-700'}`}>{claim.submissionStatus}</span></td>
                <td className="px-6 py-4 text-slate-600">{claim.aiReviewStatus}</td>
                <td className="px-6 py-4 text-slate-600">{claim.currentStage}</td>
                <td className="px-6 py-4 text-slate-600">{claim.lastUpdated}</td>
                <td className="px-6 py-4 text-slate-600">{claim.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}