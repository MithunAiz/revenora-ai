import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ArrowRight, FileText, User } from 'lucide-react';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

const statusBadgeTone: Record<string, string> = {
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Pending Validation': 'bg-sky-100 text-sky-800 border-sky-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
  'Needs Review': 'bg-amber-100 text-amber-800 border-amber-300',
  'Ready to Submit': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Submitted: 'bg-slate-100 text-slate-800 border-slate-300',
  'Under Insurance Review': 'bg-purple-100 text-purple-800 border-purple-300',
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const rowBorderColor: Record<string, string> = {
  Approved: 'border-l-4 border-l-emerald-500',
  Paid: 'border-l-4 border-l-emerald-500',
  Rejected: 'border-l-4 border-l-red-500',
  'Needs Review': 'border-l-4 border-l-amber-500',
  'Pending Validation': 'border-l-4 border-l-sky-500',
  'Ready to Submit': 'border-l-4 border-l-emerald-500',
  Submitted: 'border-l-4 border-l-purple-500',
  'Under Insurance Review': 'border-l-4 border-l-purple-500',
};

const filters = ['All', 'High Risk', 'Ready for Submission', 'Needs Documentation', 'Coding Issues', 'Compliance Issues', 'Rejected', 'Approved', 'Pending Validation', 'Assigned to Me'] as const;

const matchesFilter = (claim: any, filter: string) => {
  switch (filter) {
    case 'High Risk':
      return claim.denialRisk >= 60;
    case 'Ready for Submission':
      return claim.submissionStatus === 'Ready for Submission';
    case 'Needs Documentation':
      return claim.aiReview?.issues?.some((issue: any) => /documentation|signature|summary/i.test(issue.title));
    case 'Coding Issues':
      return claim.aiReview?.issues?.some((issue: any) => /code|modifier|billing/i.test(issue.title));
    case 'Compliance Issues':
      return claim.aiReview?.issues?.some((issue: any) => /coverage|authorization|compliance/i.test(issue.title));
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Active Claims Queue</h1>
          <p className="mt-2 text-slate-500">Live clinical claim validation queue with Indian healthcare payers, real-time risk scores, and one-click workspaces.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
          Total Claims: <span className="font-bold text-slate-950">{filteredClaims.length}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[300px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Patient, Doctor, Diagnosis, Insurer, or Claim ID..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition shadow-sm ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white ring-2 ring-slate-900'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Card-Based Table Layout for Distinct Claim Separation */}
      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No claims found matching your filter criteria.
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.claimId}
              onClick={() => navigate(`/billing/claims/${claim.claimId}`)}
              className={`group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300 ${rowBorderColor[claim.status] || 'border-l-4 border-l-slate-400'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Patient & Claim ID Info */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
                    {claim.patient.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition">{claim.patient}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">{claim.claimId}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>{claim.gender}, {claim.age} yrs</span>
                      <span>•</span>
                      <span>{claim.department}</span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Provider */}
                <div className="min-w-[200px] max-w-[280px]">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis & Doctor</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 truncate">{claim.diagnosis}</div>
                  <div className="text-xs text-slate-500 truncate">{claim.primaryPhysician}</div>
                </div>

                {/* Insurance Payer */}
                <div className="min-w-[160px]">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Insurance Payer</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">{claim.insurance}</div>
                  <div className="text-xs font-semibold text-emerald-700">₹{Number(claim.amount).toLocaleString()}</div>
                </div>

                {/* Health & Denial Risk */}
                <div className="flex items-center gap-4 min-w-[150px]">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health</div>
                    <div className="mt-1 text-base font-bold text-emerald-600">{claim.claimHealth}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Denial Risk</div>
                    <div className={`mt-1 text-base font-bold ${claim.denialRisk >= 50 ? 'text-red-600' : 'text-slate-700'}`}>
                      {claim.denialRisk}%
                    </div>
                  </div>
                </div>

                {/* Status Badges & Action */}
                <div className="flex items-center gap-3">
                  <span className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold ${statusBadgeTone[claim.submissionStatus] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {claim.submissionStatus}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}