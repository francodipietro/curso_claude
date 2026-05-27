'use client';

import { useState, useEffect } from 'react';
import { loadSchedule, saveSchedule, ScheduledJob } from '@/lib/exportHistory';
import { TEMPLATES } from '@/lib/exportTemplates';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

interface Props {
  onToast: (msg: string) => void;
}

const FREQUENCIES = [
  { value: 'daily', label: 'Daily', icon: '🌅', desc: 'Every morning at your chosen time' },
  { value: 'weekly', label: 'Weekly', icon: '📆', desc: 'Once a week on Monday' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️', desc: 'First day of each month' },
] as const;

const DESTINATIONS = [
  { value: 'download', label: 'Auto-download', icon: '💾' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'google-sheets', label: 'Google Sheets', icon: '🟢' },
  { value: 'dropbox', label: 'Dropbox', icon: '📦' },
];

function nextRunDate(freq: ScheduledJob['frequency']): string {
  const now = new Date();
  if (freq === 'daily') return format(addDays(now, 1), 'MMM d, yyyy');
  if (freq === 'weekly') return format(addWeeks(now, 1), 'MMM d, yyyy');
  return format(addMonths(now, 1), 'MMM d, yyyy');
}

export default function ExportHubSchedule({ onToast }: Props) {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    label: '',
    templateId: TEMPLATES[0].id,
    format: 'PDF',
    frequency: 'weekly' as ScheduledJob['frequency'],
    destination: 'download',
  });

  useEffect(() => {
    setJobs(loadSchedule());
  }, []);

  function persist(updated: ScheduledJob[]) {
    setJobs(updated);
    saveSchedule(updated);
  }

  function addJob() {
    if (!form.label.trim()) { onToast('Please enter a job name'); return; }
    const job: ScheduledJob = {
      id: `${Date.now()}`,
      label: form.label.trim(),
      templateId: form.templateId,
      format: form.format,
      frequency: form.frequency,
      destination: form.destination,
      enabled: true,
      nextRun: nextRunDate(form.frequency),
    };
    persist([...jobs, job]);
    setAdding(false);
    setForm({ label: '', templateId: TEMPLATES[0].id, format: 'PDF', frequency: 'weekly', destination: 'download' });
    onToast(`"${job.label}" scheduled`);
  }

  function toggleJob(id: string) {
    persist(jobs.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j)));
  }

  function deleteJob(id: string) {
    persist(jobs.filter((j) => j.id !== id));
    onToast('Schedule removed');
  }

  function simulateRun(job: ScheduledJob) {
    persist(
      jobs.map((j) =>
        j.id === job.id ? { ...j, lastRun: format(new Date(), 'MMM d, yyyy HH:mm'), nextRun: nextRunDate(j.frequency) } : j
      )
    );
    onToast(`"${job.label}" ran successfully`);
  }

  const template = (id: string) => TEMPLATES.find((t) => t.id === id);
  const dest = (id: string) => DESTINATIONS.find((d) => d.value === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Automation</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule recurring exports so your data is always up to date.
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition"
        >
          {adding ? '✕ Cancel' : '+ New Schedule'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl border-2 border-slate-800 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">New Scheduled Export</h3>

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Job Name</label>
            <input
              type="text"
              placeholder='e.g. "Monthly Tax Backup"'
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Template</label>
              <select
                value={form.templateId}
                onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Format</label>
              <div className="flex gap-2">
                {['PDF', 'CSV', 'JSON'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setForm((s) => ({ ...s, format: f }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                      form.format === f
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map(({ value, label, icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, frequency: value }))}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition ${
                    form.frequency === value
                      ? 'border-slate-800 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                  <span className="text-[10px] text-slate-400 text-center">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Destination</label>
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, destination: value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    form.destination === value
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={addJob}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition"
            >
              Create Schedule
            </button>
          </div>
        </div>
      )}

      {/* Jobs list */}
      {jobs.length === 0 && !adding ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-4xl mb-3">⏰</div>
          <p className="font-semibold text-slate-600">No scheduled exports yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Set one up to automate your financial reporting.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const tmpl = template(job.templateId);
            const destination = dest(job.destination);
            return (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border p-4 transition ${
                  job.enabled ? 'border-slate-100 shadow-sm' : 'border-dashed border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{tmpl?.icon ?? '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{job.label}</span>
                      <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                        {job.format}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium capitalize">
                        {job.frequency}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-400">
                      <span>{destination?.icon} {destination?.label ?? job.destination}</span>
                      <span>📅 Next: {job.nextRun}</span>
                      {job.lastRun && <span>✓ Last: {job.lastRun}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => simulateRun(job)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition"
                      title="Run now"
                    >
                      ▶ Run
                    </button>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleJob(job.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        job.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          job.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition text-sm"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
