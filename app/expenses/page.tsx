'use client';

import { useExpenses } from '@/hooks/useExpenses';
import ExpenseList from '@/components/ExpenseList';
import Link from 'next/link';

export default function ExpensesPage() {
  const { expenses, isLoaded, remove } = useExpenses();

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
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {expenses.length} total {expenses.length === 1 ? 'expense' : 'expenses'}
          </p>
        </div>
        <Link
          href="/add"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
        >
          <span>+</span> Add Expense
        </Link>
      </div>
      <ExpenseList expenses={expenses} onDelete={remove} />
    </div>
  );
}
