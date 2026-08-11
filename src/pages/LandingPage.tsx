import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Stethoscope, TrendingUp, Users, Workflow, AlertTriangle, RotateCcw, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '94.8%', label: 'First-pass approval rate' },
  { value: '31%', label: 'Denial reduction' },
  { value: 'Real-Time', label: 'Insurance Adjudication' },
  { value: '₹1.24Cr', label: 'Revenue protected' },
];

const capabilities = [
  {
    title: 'Pre-submission AI validation',
    desc: 'Catch documentation gaps, ICD/CPT coding mismatches, and coverage issues before a claim leaves the hospital.',
  },
  {
    title: 'Instant insurance adjudication',
    desc: 'Automated claim transmission and adjudication across Indian payers (Star Health, HDFC ERGO, ICICI Lombard, Niva Bupa, Ayushman Bharat PM-JAY).',
  },
  {
    title: 'AI denial intelligence',
    desc: 'Extract root causes, chart evidence, and recommended fixes for rejected claims to enable one-click AI resubmission.',
  },
  {
    title: 'Reimbursement & cashless settlement',
    desc: 'Track approved payer coverage (₹), patient co-pay responsibility, and cashless settlement status in real-time.',
  },
];

const workflowSteps = [
  { title: '1. Clinical Chart Pre-Validation', detail: 'Capture doctor notes, oper summaries, and medical codes in a centralized review workspace.' },
  { title: '2. Claim Submission to Insurance', detail: 'Transmit claim packets directly to insurance payers with automated pre-submission compliance verification.' },
  { title: '3. Real-Time Adjudication & Settlement', detail: 'Receive instant approved settlement amounts in ₹ or AI denial intelligence for automatic resubmission.' },
];

const trustPoints = [
  'Indian Healthcare Policy Compliant',
  'Audit-Friendly Lifecycle Stream',
  'Role-Based Staff & Patient Portals',
  'Native SQLite & API Backend Integration',
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">Revenora AI</div>
              <div className="text-xs font-semibold text-slate-500">Clinical-to-Claim Revenue Intelligence</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#capabilities" className="transition hover:text-slate-950">Platform</a>
            <a href="#workflow" className="transition hover:text-slate-950">Workflow</a>
            <a href="#security" className="transition hover:text-slate-950">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300">
              Sign in
            </Link>
            <Link to="/login" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800">
              Open Hospital Workspace
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="absolute inset-x-0 top-0 -z-10 h-[540px] bg-[radial-gradient(circle_at_top_left,_rgba(91,200,245,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(31,157,114,0.14),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#f8fafc_45%,_#eef6fb_100%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-800">
                <Sparkles className="h-4 w-4" /> End-to-End Revenue Cycle Intelligence
              </div>
              <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                Validate, Submit, Adjudicate & Reimburse Claims with AI.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 font-medium">
                Revenora AI acts as an intelligent pre-submission validation layer for hospitals—verifying clinical documentation, ICD/CPT coding, and Indian insurance rules before claims are submitted, driving automatic adjudication, AI denial resolution, and cashless reimbursement.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800">
                  Launch Portal Workspace <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#workflow" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300">
                  Explore Workflow <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {trustPoints.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Workflow Preview Card */}
            <div className="relative">
              <div className="rounded-[2rem] border-2 border-slate-200 bg-white p-6 shadow-xl lg:p-8 space-y-5">
                <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-300">Claim Review Workspace</div>
                    <div className="mt-1 text-lg font-extrabold">End-to-End Adjudication Lifecycle</div>
                  </div>
                  <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">Live AI</div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex justify-between items-center">
                    <span>Approved Payer Reimbursement:</span>
                    <span className="text-sm font-extrabold text-emerald-700">₹3,40,000</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Insurance Payer:</span>
                      <span className="font-extrabold text-slate-900">Niva Bupa / Star Health</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Claim Health Score:</span>
                      <span className="font-extrabold text-emerald-600">96%</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-100 p-4 text-slate-900">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Claims</div>
                    <div className="mt-1 text-xl font-extrabold">25 Indian Records</div>
                  </div>
                  <div className="rounded-2xl bg-slate-900 p-4 text-white">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Protected Value</div>
                    <div className="mt-1 text-xl font-extrabold">₹1.24 Crore</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="metric-card border border-slate-200">
                <div className="text-3xl font-extrabold tracking-tight text-slate-950">{item.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-700">Platform Capabilities</div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Complete Revenue Cycle Intelligence Platform</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Built specifically for hospital billing teams, medical coders, and patient transparency.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item, index) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white text-xs">0{index + 1}</div>
                <div className="text-lg font-bold text-slate-950">{item.title}</div>
                <p className="text-xs leading-6 font-medium text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Workflow className="h-5 w-5" /> End-to-End Operational Lifecycle
            </div>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight">From Patient Chart to Cashless Reimbursement</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300">Validate clinical charts, transmit packets to insurance payers, trigger instant adjudication, and manage AI denial corrections seamlessly.</p>
            <div className="mt-8 space-y-4">
              {workflowSteps.map((step) => (
                <div key={step.title} className="flex items-start gap-4 rounded-2xl bg-white/10 p-5">
                  <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-base">{step.title}</div>
                    <div className="mt-1 text-xs text-slate-300 font-medium leading-relaxed">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
          <div className="rounded-[2rem] bg-slate-900 px-8 py-10 text-white shadow-xl lg:px-10 lg:py-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-300">Get Started</div>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Experience Revenora AI Platform Live</h2>
                <p className="mt-2 max-w-2xl text-xs font-medium text-slate-300">Sign in to the patient, billing staff, or administrator portal to explore the validation workflow.</p>
              </div>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100">
                Open Login Portals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}