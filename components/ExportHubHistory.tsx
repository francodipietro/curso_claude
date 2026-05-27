'use client';

import { useState, useEffect } from 'react';
import { loadHistory, clearHistory, ExportRecord } from '@/lib/exportHistory';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Props {
  onToast: (msg: string) => void;
}

const DEST_ICONS: Record<string, string> = {
  download: '💾',
  email: '✉️',
  'google-sheets': '🟢',
  dropbox: '📦',
  onedrive: '☁️',
  slack: '💬',
  notion: '⬛',
};

const FORMAT_COLORS: Record<string, string> = {
  CSV: 'bg-green-100 text-green-700',
  JSON: 'bg-blue-100 text-blue-700',
  PDF: 'bg-red-100 text-red-700',
};

export default function ExportHubHistory({ onToast }: Props) {
  const [history, setHistory] = useState<ExportRecord[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  function handleClear() {
    clearHistory();
    setHistory([]);
    onToast('Export history cleared');
  }

  const totalExports = history.length;
  const totalRecords = history.reduce((s, h) => s + h.recordCount, 0);
  const totalKB = history.reduce((s, h) => s + h.fileSizeKB, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Export History</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            A log of every export performed from this device.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Exports', value: totalExports, icon: '📤' },
            { label: 'Records Exported', value: totalRecords.toLocaleString(), icon: '📋' },
            { label: 'Data Generated', value: totalKB > 1024 ? `${(totalKB / 1024).toFixed(1)} MB` : `${totalKB} KB`, icon: '💽' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* History list */}
      {history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold text-slate-600">No export history yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Exports from the Templates or Integrations tabs will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Export', 'Format', 'Records', 'Size', 'Destination', 'When'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((record, i) => (
                <tr
                  key={record.id}
                  className={`border-b border-slate-50 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-slate-700">{record.templateName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${FORMAT_COLORS[record.format] ?? 'bg-slate-100 text-slate-600'}`}>
                      {record.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{record.recordCount}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{record.fileSizeKB} KB</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    <span className="flex items-center gap-1">
                      <span>{DEST_ICONS[record.destination] ?? '📤'}</span>
                      <span className="capitalize">{record.destination.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {formatDistanceToNow(parseISO(record.timestamp), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
