import { useHospitalWorkflow } from '../context/HospitalWorkflowContext';

export function SettingsPage() {
  const { demoMode, toggleDemoMode, setDemoSpeed } = useHospitalWorkflow();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Settings</h1>
        <p className="mt-2 text-slate-500">Portal preferences, notification behavior, and validation thresholds.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {['Notification preferences', 'AI confidence thresholds', 'Hospital selector defaults', 'Keyboard shortcuts'].map((item) => (
          <div key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">{item}</div>
            <div className="mt-2 text-sm text-slate-500">Configured through a future backend but fully represented in the UI.</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="section-title">Demo Mode Preferences</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => toggleDemoMode(!demoMode.enabled)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{demoMode.enabled ? 'Turn Demo Mode Off' : 'Turn Demo Mode On'}</button>
          {['Normal', 'Fast', 'Presentation', 'Custom'].map((speed) => (
            <button key={speed} onClick={() => setDemoSpeed(speed as any)} className={`rounded-full px-4 py-2 text-sm font-semibold ${demoMode.speed === speed ? 'bg-medical-blue text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>{speed}</button>
          ))}
        </div>
      </div>
    </div>
  );
}