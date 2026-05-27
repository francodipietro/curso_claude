'use client';

import { useState, useMemo } from 'react';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/categories';
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'pdf';

const FORMATS: { key: ExportFormat; label: string; icon: string; desc: string }[] = [
  { key: 'csv', label: 'CSV', icon: '📊', desc: 'Spreadsheet compatible' },
  { key: 'json', label: 'JSON', icon: '🔧', desc: 'Developer friendly' },
  { key: 'pdf', label: 'PDF', icon: '📄', desc: 'Print ready' },
];

export default function ExportModal({ expenses, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(new Set(CATEGORIES));
  const [filename, setFilename] = useState(`expenses-${today}`);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const filtered = useMemo(
    () =>
      expenses.filter((e) => {
        if (startDate && e.date < startDate) return false;
        if (endDate && e.date > endDate) return false;
        if (!selectedCats.has(e.category)) return false;
        return true;
      }),
    [expenses, startDate, endDate, selectedCats]
  );

  const preview = filtered.slice(0, 5);
  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  function toggleCat(cat: Category) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat) && next.size > 1) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleAll() {
    setSelectedCats(
      selectedCats.size === CATEGORIES.length ? new Set([CATEGORIES[0]]) : new Set(CATEGORIES)
    );
  }

  function triggerDownload(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doCSV() {
    const rows = [
      ['Date', 'Category', 'Amount', 'Description'],
      ...filtered.map((e) => [
        formatShortDate(e.date),
        e.category,
        e.amount.toFixed(2),
        `"${e.description.replace(/"/g, '""')}"`,
      ]),
    ];
    triggerDownload(
      new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' }),
      `${filename}.csv`
    );
  }

  function doJSON() {
    const data = filtered.map(({ id, createdAt, ...rest }) => rest);
    triggerDownload(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      `${filename}.json`
    );
  }

  async function doPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Expense Report', 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}  •  ${filtered.length} expenses  •  Total ${formatCurrency(totalAmount)}`,
      14,
      26
    );

    autoTable(doc, {
      head: [['Date', 'Category', 'Amount', 'Description']],
      body: filtered.map((e) => [
        formatShortDate(e.date),
        e.category,
        formatCurrency(e.amount),
        e.description,
      ]),
      startY: 32,
      headStyles: { fillColor: [30, 41, 59], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    doc.save(`${filename}.pdf`);
  }

  async function handleExport() {
    if (filtered.length === 0) return;
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      if (format === 'csv') doCSV();
      else if (format === 'json') doJSON();
      else await doPDF();
      setExported(true);
      setTimeout(() => {
        setExported(false);
        onClose();
      }, 1200);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] flex flex-col rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Export Data</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Configure your export options below
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Format */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {FORMATS.map(({ key, label, icon, desc }) => (
                <button
                  key={key}
                  onClick={() => setFormat(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                    format === key
                      ? 'border-slate-800 bg-slate-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="font-bold text-sm text-slate-800">{label}</span>
                  <span className="text-xs text-slate-400">{desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Date range */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">From</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">To</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </section>

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Categories</h3>
              <button
                onClick={toggleAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
              >
                {selectedCats.size === CATEGORIES.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const active = selectedCats.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? `${cfg.bgColor} ${cfg.color} border-transparent shadow-sm`
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    {cat}
                    {active && <span className="opacity-50 text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Filename */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Filename</h3>
            <div className="flex items-stretch gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value || `expenses-${today}`)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <div className="px-3 flex items-center rounded-xl bg-slate-100 text-slate-500 text-sm font-medium border border-slate-200">
                .{format}
              </div>
            </div>
          </section>

          {/* Preview */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    filtered.length > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                </span>
                {filtered.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {formatCurrency(totalAmount)}
                  </span>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl text-slate-400 text-sm">
                No expenses match your current filters
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Date', 'Category', 'Amount', 'Description'].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((e, i) => (
                      <tr
                        key={e.id}
                        className={`border-b border-slate-100 last:border-0 ${
                          i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                        }`}
                      >
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap text-xs">
                          {formatDate(e.date)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_CONFIG[e.category].bgColor} ${CATEGORY_CONFIG[e.category].color}`}
                          >
                            {e.category}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-800 font-semibold text-xs">
                          {formatCurrency(e.amount)}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[150px] truncate">
                          {e.description}
                        </td>
                      </tr>
                    ))}
                    {filtered.length > 5 && (
                      <tr className="bg-slate-50">
                        <td
                          colSpan={4}
                          className="px-3 py-2 text-xs text-slate-400 text-center"
                        >
                          …and {filtered.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0 || isExporting || exported}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${
              exported
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {exported ? (
              '✓ Downloaded!'
            ) : isExporting ? (
              <>
                <span className="inline-block animate-spin">⟳</span> Exporting…
              </>
            ) : (
              `Export ${filtered.length > 0 ? `${filtered.length} records` : ''} as ${format.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
