'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseFilters } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { filterExpenses, exportToCSV, formatCurrency } from '@/lib/utils';
import ExpenseItem from './ExpenseItem';

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const DEFAULT_FILTERS: ExpenseFilters = {
  startDate: '',
  endDate: '',
  category: 'All',
  searchQuery: '',
};

export default function ExpenseList({ expenses, onDelete }: Props) {
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => filterExpenses(expenses, filters), [expenses, filters]);

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  function set<K extends keyof ExpenseFilters>(key: K, val: ExpenseFilters[K]) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search expenses…"
            value={filters.searchQuery}
            onChange={(e) => set('searchQuery', e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <select
            value={filters.category}
            onChange={(e) => set('category', e.target.value as ExpenseFilters['category'])}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Clear
            </button>
            <button
              onClick={() => exportToCSV(filtered)}
              disabled={filtered.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition disabled:opacity-40"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
          {filtered.length !== expenses.length && ` of ${expenses.length}`}
        </span>
        {filtered.length > 0 && (
          <span className="text-sm font-semibold text-slate-700">
            Total: {formatCurrency(totalFiltered)}
          </span>
        )}
      </div>

      {/* Expense items */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No expenses found</p>
          <p className="text-sm mt-1">
            {expenses.length === 0 ? 'Add your first expense to get started!' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
