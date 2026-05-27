'use client';

import { useExpenses } from '@/hooks/useExpenses';
import SummaryCards from '@/components/SummaryCards';
import SpendingChart from '@/components/SpendingChart';
import RecentExpenses from '@/components/RecentExpenses';
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
        <Link
          href="/add"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
        >
          <span>+</span> Add Expense
        </Link>
      </div>

      <SummaryCards expenses={expenses} />
      <SpendingChart expenses={expenses} />
      <RecentExpenses expenses={expenses} />

      {/* Export Hub promo */}
      <Link
        href="/export"
        className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl px-6 py-4 text-white hover:from-slate-700 hover:to-slate-800 transition group shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">☁️</span>
          <div>
            <p className="font-bold text-sm">Export Hub</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Templates · Cloud integrations · Automation · History
            </p>
          </div>
        </div>
        <span className="text-slate-400 group-hover:text-white transition text-lg">→</span>
      </Link>
    </div>
  );
}
