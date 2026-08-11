import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, LockKeyhole, Shield, Users, UserRound } from 'lucide-react';
import { authDemoAccounts, getPortalRoute, useAuth } from '../context/AuthContext';
import { Role } from '../types';

const roles = [
  { title: 'Patient Portal', icon: UserRound, to: '/patient', desc: 'View claim status, bills, documents, and payment summaries.' },
  { title: 'Billing Staff Portal', icon: Users, to: '/billing', desc: 'Core workspace for AI claim validation, coding, and submission.' },
  { title: 'Administrator Portal', icon: Shield, to: '/admin', desc: 'Manage users, patient feedback reports, audit logs, and system health.' },
];

const initialFormState = roles.reduce<Record<string, { email: string; password: string }>>((accumulator, role) => {
  const account = authDemoAccounts.find((entry) => entry.role === role.title as Role);
  accumulator[role.title] = { email: account?.email ?? '', password: account?.password ?? '' };
  return accumulator;
}, {});

export function RoleSelectPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState(initialFormState);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getPortalRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  if (isAuthenticated && user) {
    return <Navigate to={getPortalRoute(user.role)} replace />;
  }

  const handleLogin = (role: Role) => {
    const credentials = formState[role];
    const result = login(role, credentials.email, credentials.password);
    if (!result.success) {
      setErrorMessage(result.error ?? 'Unable to sign in.');
      return;
    }

    setErrorMessage('');
    navigate(getPortalRoute(role), { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-premium lg:p-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-cyan-700">Enterprise Authentication</div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Sign in to Hospital Portal</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">Select your authorized role to access patient care, medical billing, or administrator workspaces.</p>
          </div>
        </div>

        {errorMessage ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div> : null}
        
        <div className="grid gap-6 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.title} className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <role.icon className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xl font-extrabold text-slate-950">{role.title}</div>
              <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">{role.desc}</p>

              <div className="mt-6 space-y-4">
                <label className="block text-xs text-slate-600">
                  <span className="font-bold text-slate-900">Email Address</span>
                  <input
                    value={formState[role.title].email}
                    onChange={(event) => setFormState((current) => ({ ...current, [role.title]: { ...current[role.title], email: event.target.value } }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-slate-900"
                    placeholder="user@hospital.com"
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  <span className="font-bold text-slate-900">Password</span>
                  <input
                    value={formState[role.title].password}
                    onChange={(event) => setFormState((current) => ({ ...current, [role.title]: { ...current[role.title], password: event.target.value } }))}
                    type="password"
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-slate-900"
                    placeholder="••••••••••••"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleLogin(role.title as Role)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800"
                >
                  Sign in to {role.title} <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}