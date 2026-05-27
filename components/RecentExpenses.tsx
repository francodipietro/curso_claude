'use client';

import Link from 'next/link';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface Props {
  expenses: Expense[];
}

export default function RecentExpenses({ expenses }: Props) {
  const recent = expenses.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Recent Expenses</h3>
        <Link href="/expenses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <div className="text-3xl mb-2">💸</div>
          <p className="text-sm">No expenses yet. <Link href="/add" className="text-blue-600 hover:underline">Add one!</Link></p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((expense) => {
            const cfg = CATEGORY_CONFIG[expense.category];
            return (
              <div key={expense.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${cfg.bgColor} flex items-center justify-center text-base flex-shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{expense.description}</p>
                  <p className="text-xs text-slate-400">{formatDate(expense.date)}</p>
                </div>
                <span className="text-sm font-semibold text-slate-800 flex-shrink-0">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
