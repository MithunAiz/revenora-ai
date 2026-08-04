import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Stethoscope, TrendingUp, Users, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '94.8%', label: 'Approval lift' },
  { value: '31%', label: 'Denial reduction' },
  { value: '4.2m', label: 'Average review time' },
  { value: '$1.24M', label: 'Revenue protected' },
];

const capabilities = [
  {
    title: 'Pre-submission claim review',
    desc: 'Catch documentation gaps, coding mismatches, and coverage problems before a claim leaves the hospital.',
  },
  {
    title: 'Explainable AI findings',
    desc: 'Every issue includes evidence, why it matters, and the recommended fix so teams can act quickly.',
  },
  {
    title: 'Real workflow synchronization',
    desc: 'Changes in the claim workspace update dashboards, alerts, timelines, and review queues instantly.',
  },
  {
    title: 'Demo-ready operations mode',
    desc: 'A presentation mode keeps the platform moving like a live hospital without manual triggering.',
  },
];

const workflowSteps = [
  { title: 'Clinical documentation', detail: 'Capture the story of care in a structured review workspace.' },
  { title: 'AI validation', detail: 'Compare notes, codes, billing, and payer rules in one pass.' },
  { title: 'Corrections and resubmission', detail: 'Apply fixes, revalidate, and move the claim toward clean submission.' },
];

const trustPoints = ['HIPAA-aware workflow patterns', 'Audit-friendly activity logs', 'Hospital-grade role separation', 'Mock backend ready for real API integration'];

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
              <div className="text-lg font-semibold tracking-tight">Revenora AI</div>
              <div className="text-xs text-slate-500">AI-Powered Clinical-to-Claim Validation</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 lg:flex">
            <a href="#capabilities" className="transition hover:text-slate-950">Platform</a>
            <a href="#workflow" className="transition hover:text-slate-950">Workflow</a>
            <a href="#security" className="transition hover:text-slate-950">Security</a>
            <a href="#contact" className="transition hover:text-slate-950">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              Sign in
            </Link>
            <a href="#contact" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90">
              Request demo
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="absolute inset-x-0 top-0 -z-10 h-[540px] bg-[radial-gradient(circle_at_top_left,_rgba(91,200,245,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(31,157,114,0.14),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#f8fafc_45%,_#eef6fb_100%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                <Sparkles className="h-4 w-4" /> Enterprise healthcare workflow
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                Catch denials before submission with a claim quality layer built for hospitals.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Revenora AI sits between claim generation and the clearinghouse, reviewing documentation, coding, billing, and payer rules so teams can ship cleaner claims with confidence.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-medical-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5">
                  Sign in to the platform <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#workflow" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
                  See workflow <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {trustPoints.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-cyan-200/50 blur-3xl animate-pulseGlow" />
              <div className="absolute bottom-8 right-6 h-32 w-32 rounded-full bg-emerald-200/50 blur-3xl animate-pulseGlow" />
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-premium lg:p-8">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Claim Review Workspace</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">Live review, explain, correct, submit</div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">AI active</div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ['Claim health', '89', 'good'],
                    ['Documentation score', '84', 'warning'],
                    ['Coverage validation', 'Passed', 'good'],
                  ].map(([label, value, tone]) => (
                    <div key={label as string} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{label as string}</span>
                        <span className={`font-semibold ${tone === 'good' ? 'text-emerald-700' : 'text-amber-700'}`}>{value as string}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div className={`h-2 rounded-full ${tone === 'good' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: tone === 'good' ? '89%' : '84%' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Review queue', '24 claims'],
                    ['Claims saved', '64 this month'],
                    ['Revenue protected', '$1.24M'],
                    ['Avg review time', '4.2m'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-2xl bg-slate-900 p-4 text-white">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-300">{label as string}</div>
                      <div className="mt-2 text-xl font-semibold">{value as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="metric-card">
                <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
                <div className="mt-2 text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Platform</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Everything the revenue cycle team needs in one connected experience</h2>
            <p className="mt-3 text-slate-500">The product is built to feel like a real enterprise system, with the review workspace at the center and every dashboard reflecting the same operational state.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item, index) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">0{index + 1}</div>
                <div className="mt-5 text-xl font-semibold text-slate-950">{item.title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-premium">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Workflow className="h-5 w-5 text-cyan-300" /> Operational flow
              </div>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight">A clean path from chart to submission</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">Review the clinical story, inspect the AI findings, apply fixes, and push the claim toward ready-to-submit status without leaving the workspace.</p>
              <div className="mt-8 space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-4 rounded-2xl bg-white/8 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900">0{index + 1}</div>
                    <div>
                      <div className="font-semibold">{step.title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-300">{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-premium">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Security</div>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Enterprise-grade controls for hospital operations</h3>
                </div>
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ['Role separation', 'Each portal only exposes the tools that role should access.'],
                  ['Audit trail', 'User actions, claim corrections, and AI recommendations are tracked.'],
                  ['Mock backend', 'Local service layers simulate APIs and persist demo feedback.'],
                  ['Future-ready', 'The structure is ready for a real backend or AI service later.'],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl bg-slate-50 p-5">
                    <div className="font-semibold text-slate-950">{title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-900">Recommended next step</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to the portal that matches your role, then open a claim and walk the workflow end to end.</p>
                <Link to="/login" className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                  Go to sign in <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Why teams use it</div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Built for hospitals, not for a chatbot demo</h2>
                <p className="mt-3 max-w-2xl text-slate-500">The public site sells the workflow honestly, the login experience is role-specific, and the claim workspace keeps the platform grounded in real operational behavior.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Users', 'Billing, patient, and admin teams sign in separately.'],
                  ['Data', 'Mocked claim data behaves like a live production system.'],
                  ['Actions', 'Every click updates a downstream state.'],
                  ['Demo mode', 'Presentation mode can drive the whole workflow.'],
                ].map(([label, desc]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users className="h-4 w-4 text-medical-blue" />{label}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
          <div className="rounded-[2rem] bg-slate-900 px-8 py-10 text-white shadow-premium lg:px-10 lg:py-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">Get started</div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Ready to review claims like a real hospital team?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Use the role-specific login page to enter the billing, patient, or administrator experience and walk through the full validation workflow.</p>
              </div>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:opacity-90">
                Open login <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}