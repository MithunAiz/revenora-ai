import { PropsWithChildren } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, ClipboardList, LayoutDashboard, LogOut, MessageSquare, Search, Settings, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { Role } from '../types';
import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';
import { useAuth } from '../context/AuthContext';

interface AppShellProps {
  role: Role;
}

const navItemsByRole: Record<Role, Array<{ to?: string; label: string; icon: typeof LayoutDashboard; end?: boolean; action?: 'logout' }>> = {
  'Billing Staff Portal': [
    { to: '/billing', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/billing/claims', label: 'Claims', icon: ClipboardList },
    { to: '/billing/ai-reviewer', label: 'AI Claim Reviewer', icon: Sparkles },
    { to: '/billing/analytics', label: 'Analytics', icon: ShieldCheck },
    { to: '/billing/notifications', label: 'Notifications', icon: Bell },
    { to: '/billing/settings', label: 'Settings', icon: Settings },
    { label: 'Logout', icon: LogOut, action: 'logout' },
  ],
  'Patient Portal': [
    { to: '/patient', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/patient/notifications', label: 'Notifications', icon: Bell },
    { to: '/patient/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/patient/settings', label: 'Settings', icon: Settings },
    { label: 'Logout', icon: LogOut, action: 'logout' },
  ],
  'Administrator Portal': [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/analytics', label: 'Analytics', icon: ShieldCheck },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
    { label: 'Logout', icon: LogOut, action: 'logout' },
  ],
};

export function AppShell({ role }: PropsWithChildren<AppShellProps>) {
  const { notifications, demoMode } = useHospitalWorkflow();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navItemsByRole[role];
  const notificationPath = role === 'Administrator Portal' ? '/admin/notifications' : role === 'Patient Portal' ? '/patient/notifications' : '/billing/notifications';
  const settingsPath = role === 'Administrator Portal' ? '/admin/settings' : role === 'Patient Portal' ? '/patient/settings' : '/billing/settings';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200/80 bg-white/80 p-6 backdrop-blur lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">Revenora AI</div>
              <div className="text-xs text-slate-500">Clinical-to-Claim Validation</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              item.action === 'logout' ? (
                <button key={item.label} type="button" onClick={handleLogout} className="nav-link w-full text-left">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ) : (
                <NavLink key={item.to} to={item.to ?? '/'} end={Boolean(item.end)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-slate-900 p-5 text-white shadow-premium">
            <p className="text-sm font-medium text-slate-200">Current AI status</p>
            <p className="mt-1 text-2xl font-semibold">Monitoring</p>
            <p className="mt-2 text-sm text-slate-300">All claim validation pipelines are active.</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/90 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                Global Search
              </div>
              <div className={`status-chip ${demoMode.running ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>AI status: {demoMode.running ? 'Active' : 'Paused'}</div>
              <div className="status-chip bg-cyan-50 text-sky-700">Hospital: Mayo Clinic</div>
              <div className="status-chip bg-amber-50 text-amber-700">Role: {user?.role ?? role}</div>
              <div className="ml-auto flex items-center gap-3">
                <Link to={notificationPath} className="relative rounded-full border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="View notifications">
                  <Bell className="h-4 w-4 text-slate-600" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-medical-red px-1 text-[10px] font-semibold text-white">{notifications.length}</span>
                </Link>
                <Link to={settingsPath} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  Settings
                </Link>
                <button type="button" onClick={handleLogout} className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
