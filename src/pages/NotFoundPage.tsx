import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="text-2xl font-semibold">Page not found</div>
        <p className="mt-2 text-slate-500">The requested route does not exist in this frontend mockup.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Return home</Link>
      </div>
    </div>
  );
}