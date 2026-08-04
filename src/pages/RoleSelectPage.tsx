import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, LockKeyhole, Shield, Users, UserRound } from 'lucide-react';
import { authDemoAccounts, getPortalRoute, useAuth } from '../context/AuthContext';
import { Role } from '../types';

const roles = [
  { title: 'Patient Portal', icon: UserRound, to: '/patient', desc: 'View claim status, bills, documents, and support.' },
  { title: 'Billing Staff Portal', icon: Users, to: '/billing', desc: 'Core workflow for claim validation and review.' },
  { title: 'Administrator Portal', icon: Shield, to: '/admin', desc: 'Manage users, permissions, audit logs, and system health.' },
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
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Secure login</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Sign in to the correct hospital portal</h2>
            <p className="mt-2 max-w-2xl text-slate-500">Each portal uses its own role-based sign-in so staff, patients, and administrators only reach the tools they are meant to use.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900"><LockKeyhole className="h-4 w-4 text-medical-blue" /> Demo credentials</div>
            <p className="mt-2">Patient: patient@revenora.ai / Patient123!</p>
            <p>Billing: billing@revenora.ai / Billing123!</p>
            <p>Admin: admin@revenora.ai / Admin123!</p>
          </div>
        </div>
        {errorMessage ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.title} className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white">
              <role.icon className="h-8 w-8 text-medical-blue" />
              <div className="mt-6 text-xl font-semibold">{role.title}</div>
              <p className="mt-2 text-sm text-slate-500">{role.desc}</p>

              <div className="mt-6 space-y-3">
                <label className="block text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Email</span>
                  <input value={formState[role.title].email} onChange={(event) => setFormState((current) => ({ ...current, [role.title]: { ...current[role.title], email: event.target.value } }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-medical-blue" placeholder="name@hospital.com" />
                </label>
                <label className="block text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Password</span>
                  <input value={formState[role.title].password} onChange={(event) => setFormState((current) => ({ ...current, [role.title]: { ...current[role.title], password: event.target.value } }))} type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-medical-blue" placeholder="Enter password" />
                </label>
                <button type="button" onClick={() => handleLogin(role.title as Role)} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90">
                  Sign in <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}