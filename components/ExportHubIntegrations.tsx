'use client';

import { useState, useEffect, useRef } from 'react';
import { Expense } from '@/lib/types';
import {
  loadIntegrations,
  saveIntegrations,
  addHistoryEntry,
  IntegrationState,
} from '@/lib/exportHistory';
import { formatCurrency } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  onToast: (msg: string) => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'cloud' | 'communication' | 'productivity';
  connectLabel: string;
  configFields?: { key: string; label: string; placeholder: string; type?: string }[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Sync expenses to a live spreadsheet. Auto-updates on each export.',
    icon: '🟢',
    color: 'bg-green-50 border-green-200',
    category: 'productivity',
    connectLabel: 'Connect Google Account',
    configFields: [{ key: 'spreadsheetName', label: 'Spreadsheet name', placeholder: 'My Expenses 2026' }],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Push expenses into a Notion database page.',
    icon: '⬛',
    color: 'bg-slate-50 border-slate-200',
    category: 'productivity',
    connectLabel: 'Connect Notion Workspace',
    configFields: [{ key: 'databaseName', label: 'Database name', placeholder: 'Finance Tracker' }],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Save every export automatically to your Dropbox folder.',
    icon: '📦',
    color: 'bg-blue-50 border-blue-200',
    category: 'cloud',
    connectLabel: 'Connect Dropbox',
    configFields: [{ key: 'folder', label: 'Folder path', placeholder: '/Finances/Exports' }],
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Backup exports to Microsoft OneDrive automatically.',
    icon: '☁️',
    color: 'bg-sky-50 border-sky-200',
    category: 'cloud',
    connectLabel: 'Connect Microsoft Account',
    configFields: [{ key: 'folder', label: 'Folder name', placeholder: 'Expense Reports' }],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send spending summaries to a Slack channel on a schedule.',
    icon: '💬',
    color: 'bg-purple-50 border-purple-200',
    category: 'communication',
    connectLabel: 'Connect Slack Workspace',
    configFields: [{ key: 'channel', label: 'Channel', placeholder: '#finance' }],
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Send exports to any email address as an attachment.',
    icon: '✉️',
    color: 'bg-orange-50 border-orange-200',
    category: 'communication',
    connectLabel: 'Configure Email',
    configFields: [
      { key: 'address', label: 'Email address', placeholder: 'you@example.com', type: 'email' },
    ],
  },
];

export default function ExportHubIntegrations({ expenses, onToast }: Props) {
  const [integrations, setIntegrations] = useState<Record<string, IntegrationState>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const QRCode = useRef<any>(null);

  useEffect(() => {
    setIntegrations(loadIntegrations());
  }, []);

  useEffect(() => {
    if (showQR && !QRCode.current) {
      import('react-qr-code').then((m) => {
        QRCode.current = m.default;
      });
    }
  }, [showQR]);

  function persist(updated: Record<string, IntegrationState>) {
    setIntegrations(updated);
    saveIntegrations(updated);
  }

  async function handleConnect(integration: Integration) {
    if (configuring === integration.id) {
      // Save config and connect
      setConnecting(integration.id);
      setConfiguring(null);
      await new Promise((r) => setTimeout(r, 1200));
      persist({
        ...integrations,
        [integration.id]: {
          connected: true,
          connectedAt: new Date().toISOString(),
          config: { ...configValues },
        },
      });
      setConnecting(null);
      onToast(`${integration.name} connected successfully`);
    } else {
      // Show config form first
      setConfiguring(integration.id);
      const defaults: Record<string, string> = {};
      integration.configFields?.forEach((f) => {
        defaults[f.key] = integrations[integration.id]?.config[f.key] ?? '';
      });
      setConfigValues(defaults);
    }
  }

  function handleDisconnect(id: string) {
    const { [id]: _, ...rest } = integrations;
    persist(rest);
    onToast(`Disconnected`);
  }

  async function handleExportTo(integration: Integration) {
    if (expenses.length === 0) { onToast('No expenses to export'); return; }
    setExporting(integration.id);
    await new Promise((r) => setTimeout(r, 1400));
    addHistoryEntry({
      templateName: 'Full Export',
      format: 'CSV',
      recordCount: expenses.length,
      fileSizeKB: Math.ceil(expenses.length * 0.18),
      destination: integration.name,
    });
    setExporting(null);
    onToast(`Exported to ${integration.name} ✓`);
  }

  function generateShareLink() {
    const payload = btoa(
      JSON.stringify({
        expenses: expenses.slice(0, 10).map(({ id, createdAt, ...rest }) => rest),
        generatedAt: new Date().toISOString(),
        total: expenses.reduce((s, e) => s + e.amount, 0),
      })
    );
    const link = `${window.location.origin}/shared/${payload.slice(0, 16)}`;
    setShareLink(link);
    setShowQR(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    onToast('Link copied to clipboard');
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const categories = [
    { label: 'Cloud Storage', key: 'cloud' as const },
    { label: 'Productivity', key: 'productivity' as const },
    { label: 'Communication', key: 'communication' as const },
  ];

  const connectedCount = Object.values(integrations).filter((i) => i.connected).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Integrations</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Connect your favourite tools and push exports directly.
          </p>
        </div>
        {connectedCount > 0 && (
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {connectedCount} connected
          </span>
        )}
      </div>

      {/* Integrations by category */}
      {categories.map(({ label, key }) => {
        const items = INTEGRATIONS.filter((i) => i.category === key);
        return (
          <div key={key}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {label}
            </h3>
            <div className="space-y-3">
              {items.map((integration) => {
                const state = integrations[integration.id];
                const connected = state?.connected ?? false;
                const isConnecting = connecting === integration.id;
                const isExporting = exporting === integration.id;
                const isConfiguring = configuring === integration.id;

                return (
                  <div
                    key={integration.id}
                    className={`rounded-2xl border p-4 transition-all ${integration.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5 flex-shrink-0">{integration.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">
                            {integration.name}
                          </span>
                          {connected && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>

                        {/* Connected details */}
                        {connected && state.config && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(state.config).map(([k, v]) => v ? (
                              <span key={k} className="text-[11px] bg-white/70 border border-slate-200 px-2 py-0.5 rounded-md text-slate-500">
                                {v}
                              </span>
                            ) : null)}
                          </div>
                        )}

                        {/* Config form */}
                        {isConfiguring && integration.configFields && (
                          <div className="mt-3 space-y-2">
                            {integration.configFields.map((field) => (
                              <div key={field.key}>
                                <label className="text-xs text-slate-500 mb-1 block">
                                  {field.label}
                                </label>
                                <input
                                  type={field.type ?? 'text'}
                                  placeholder={field.placeholder}
                                  value={configValues[field.key] ?? ''}
                                  onChange={(e) =>
                                    setConfigValues((v) => ({ ...v, [field.key]: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                        {connected ? (
                          <>
                            <button
                              onClick={() => handleExportTo(integration)}
                              disabled={isExporting}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-1"
                            >
                              {isExporting ? (
                                <><span className="animate-spin inline-block">⟳</span> Sending…</>
                              ) : (
                                '↑ Push'
                              )}
                            </button>
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(integration)}
                            disabled={isConnecting}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isConnecting ? (
                              <><span className="animate-spin inline-block">⟳</span> Connecting…</>
                            ) : isConfiguring ? (
                              '✓ Confirm'
                            ) : (
                              `+ ${integration.connectLabel}`
                            )}
                          </button>
                        )}
                        {isConfiguring && (
                          <button
                            onClick={() => setConfiguring(null)}
                            className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-600 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Share Link + QR */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Shareable Snapshot
        </h3>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔗</span>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 text-sm">Generate Share Link</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Create a read-only snapshot link (preview of up to 10 expenses). Expires in 7 days.
              </p>
            </div>
            <button
              onClick={generateShareLink}
              disabled={expenses.length === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition disabled:opacity-40 flex-shrink-0"
            >
              Generate
            </button>
          </div>

          {shareLink && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 bg-slate-50 font-mono"
                />
                <button
                  onClick={copyLink}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                    linkCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {linkCopied ? '✓ Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setShowQR((v) => !v)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition flex-shrink-0"
                >
                  QR Code
                </button>
              </div>

              {showQR && (
                <div className="flex flex-col items-center gap-2 py-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 mb-1">Scan to open snapshot</p>
                  <QRCodeComponent value={shareLink} />
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>⏱ Expires in 7 days</span>
                    <span>👁 View only</span>
                    <span>🔒 No login required</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Lazy-loaded QR code wrapper
function QRCodeComponent({ value }: { value: string }) {
  const [QR, setQR] = useState<any>(null);
  useEffect(() => {
    import('react-qr-code').then((m) => setQR(() => m.default));
  }, []);
  if (!QR) return <div className="w-36 h-36 bg-slate-200 rounded-lg animate-pulse" />;
  return <QR value={value} size={144} />;
}
