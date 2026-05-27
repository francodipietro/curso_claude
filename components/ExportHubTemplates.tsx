'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import { TEMPLATES, ExportTemplate } from '@/lib/exportTemplates';
import { addHistoryEntry } from '@/lib/exportHistory';
import { formatCurrency, formatShortDate } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  onToast: (msg: string) => void;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function runExport(
  template: ExportTemplate,
  format: string,
  expenses: Expense[]
) {
  const data = template.build(expenses);
  const slug = template.id;
  const ts = new Date().toISOString().split('T')[0];
  const filename = `${slug}-${ts}`;

  if (format === 'CSV') {
    const rows = [data.headers, ...data.rows];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    triggerDownload(new Blob([csv], { type: 'text/csv' }), `${filename}.csv`);
    return csv.length;
  }

  if (format === 'JSON') {
    const json = JSON.stringify(
      {
        title: data.title,
        generatedAt: new Date().toISOString(),
        summary: data.summary,
        data: data.rows.map((row) =>
          Object.fromEntries(data.headers.map((h, i) => [h, row[i]]))
        ),
      },
      null,
      2
    );
    triggerDownload(new Blob([json], { type: 'application/json' }), `${filename}.json`);
    return json.length;
  }

  // PDF
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text(data.title, 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(data.subtitle, 14, 25);

  let y = 32;
  // Summary box
  const summaryEntries = Object.entries(data.summary);
  if (summaryEntries.length > 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, summaryEntries.length * 6 + 8, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    summaryEntries.forEach(([k, v], i) => {
      doc.text(`${k}: ${v}`, 20, y + 6 + i * 6);
    });
    y += summaryEntries.length * 6 + 14;
  }

  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: y,
    headStyles: { fillColor: [30, 41, 59], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
  return 1024;
}

export default function ExportHubTemplates({ expenses, onToast }: Props) {
  const [running, setRunning] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>({});

  async function handleExport(template: ExportTemplate) {
    if (expenses.length === 0) {
      onToast('No expenses to export');
      return;
    }
    const fmt = selectedFormat[template.id] || template.formats[0];
    setRunning(template.id);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const bytes = await runExport(template, fmt, expenses);
      addHistoryEntry({
        templateName: template.name,
        format: fmt,
        recordCount: template.build(expenses).rows.length,
        fileSizeKB: Math.ceil(bytes / 1024) || 1,
        destination: 'download',
      });
      setDone(template.id);
      onToast(`${template.name} exported as ${fmt}`);
      setTimeout(() => setDone(null), 2000);
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Export Templates</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Pre-configured exports for common use cases — pick one and download instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((template) => {
          const fmt = selectedFormat[template.id] || template.formats[0];
          const isRunning = running === template.id;
          const isDone = done === template.id;
          const data = expenses.length > 0 ? template.build(expenses) : null;

          return (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Coloured header strip */}
              <div className={`bg-gradient-to-r ${template.accent} px-5 py-4 flex items-start justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{template.name}</span>
                      {template.badge && (
                        <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {template.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-xs mt-0.5">{template.description}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                {/* Preview stats */}
                {data && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.summary)
                      .slice(0, 3)
                      .map(([k, v]) => (
                        <div key={k} className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{k}</p>
                          <p className="text-xs font-semibold text-slate-700">{v}</p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Format + Export */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {template.formats.map((f) => (
                      <button
                        key={f}
                        onClick={() =>
                          setSelectedFormat((prev) => ({ ...prev, [template.id]: f }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          fmt === f
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleExport(template)}
                    disabled={isRunning || expenses.length === 0}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40'
                    }`}
                  >
                    {isDone ? (
                      '✓ Done'
                    ) : isRunning ? (
                      <><span className="animate-spin inline-block">⟳</span> Exporting…</>
                    ) : (
                      <>↓ Export {fmt}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {expenses.length === 0 && (
        <p className="text-center text-sm text-slate-400 pt-4">
          Add some expenses first to enable exports.
        </p>
      )}
    </div>
  );
}
