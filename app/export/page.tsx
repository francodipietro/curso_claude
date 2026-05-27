'use client';

import { useState, useEffect } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import ExportHubTemplates from '@/components/ExportHubTemplates';
import ExportHubIntegrations from '@/components/ExportHubIntegrations';
import ExportHubSchedule from '@/components/ExportHubSchedule';
import ExportHubHistory from '@/components/ExportHubHistory';
import { formatCurrency } from '@/lib/utils';

type Tab = 'templates' | 'integrations' | 'schedule' | 'history';

interface Toast {
  id: number;
  message: string;
}

const TABS: { key: Tab; label: string; icon: string; desc: string }[] = [
  { key: 'templates', label: 'Templates', icon: '📋', desc: 'Pre-built export presets' },
  { key: 'integrations', label: 'Integrations', icon: '🔗', desc: 'Cloud connections & sharing' },
  { key: 'schedule', label: 'Automation', icon: '⏰', desc: 'Recurring scheduled exports' },
  { key: 'history', label: 'History', icon: '🕐', desc: 'Past export log' },
];

export default function ExportHubPage() {
  const { expenses, isLoaded } = useExpenses();
  const [tab, setTab] = useState<Tab>('templates');
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">☁️</span>
              <h1 className="text-2xl font-bold">Export Hub</h1>
            </div>
            <p className="text-slate-400 text-sm">
              Templates, integrations, and automation — all your export tools in one place.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold">{expenses.length}</div>
            <div className="text-slate-400 text-xs">total expenses</div>
            <div className="text-slate-300 text-sm font-semibold mt-1">
              {formatCurrency(totalSpend)}
            </div>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="flex gap-4 mt-5 pt-4 border-t border-slate-700 flex-wrap">
          {[
            { label: 'Ready to export', value: `${expenses.length} records` },
            { label: 'Export formats', value: 'CSV, PDF, JSON' },
            { label: 'Integrations', value: '6 available' },
            { label: 'Automation', value: 'Schedule ready' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xs text-slate-400">{label}</div>
              <div className="text-sm font-semibold text-slate-200">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map(({ key, label, icon, desc }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 min-w-0 flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
              tab === key
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className="text-lg sm:text-base flex-shrink-0">{icon}</span>
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-xs sm:text-sm font-semibold leading-none">{label}</div>
              <div className={`text-[10px] mt-0.5 hidden sm:block ${tab === key ? 'text-slate-300' : 'text-slate-400'}`}>
                {desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'templates' && (
          <ExportHubTemplates expenses={expenses} onToast={showToast} />
        )}
        {tab === 'integrations' && (
          <ExportHubIntegrations expenses={expenses} onToast={showToast} />
        )}
        {tab === 'schedule' && (
          <ExportHubSchedule onToast={showToast} />
        )}
        {tab === 'history' && (
          <ExportHubHistory onToast={showToast} />
        )}
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, message }) => (
          <div
            key={id}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
          >
            <span className="text-emerald-400">✓</span>
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}
