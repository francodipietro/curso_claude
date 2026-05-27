'use client';

import { useExpenses } from '@/hooks/useExpenses';
import SummaryCards from '@/components/SummaryCards';
import SpendingChart from '@/components/SpendingChart';
import RecentExpenses from '@/components/RecentExpenses';
import { exportToCSV } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(expenses)}
            disabled={expenses.length === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition disabled:opacity-40"
          >
            Export CSV
          </button>
          <Link
            href="/add"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
          >
            <span>+</span> Add Expense
          </Link>
        </div>
      </div>

      <SummaryCards expenses={expenses} />
      <SpendingChart expenses={expenses} />
      <RecentExpenses expenses={expenses} />
    </div>
  );
}
