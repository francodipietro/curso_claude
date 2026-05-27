'use client';

import { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/categories';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

interface Props {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: Props) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const now = new Date();
  const monthly = expenses
    .filter((e) =>
      isWithinInterval(parseISO(e.date), {
        start: startOfMonth(now),
        end: endOfMonth(now),
      })
    )
    .reduce((s, e) => s + e.amount, 0);

  const categoryTotals = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>
  );
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const avgPerExpense = expenses.length ? total / expenses.length : 0;

  const cards = [
    {
      label: 'Total Spending',
      value: formatCurrency(total),
      sub: `${expenses.length} transactions`,
      icon: '💳',
      color: 'from-slate-600 to-slate-800',
    },
    {
      label: 'This Month',
      value: formatCurrency(monthly),
      sub: 'Current month',
      icon: '📅',
      color: 'from-blue-500 to-blue-700',
    },
    {
      label: 'Top Category',
      value: topCategory ? topCategory[0] : '—',
      sub: topCategory ? formatCurrency(topCategory[1]) : 'No data',
      icon: topCategory ? CATEGORY_CONFIG[topCategory[0] as keyof typeof CATEGORY_CONFIG]?.icon ?? '📦' : '📦',
      color: 'from-purple-500 to-purple-700',
    },
    {
      label: 'Avg per Expense',
      value: formatCurrency(avgPerExpense),
      sub: 'Average amount',
      icon: '📈',
      color: 'from-emerald-500 to-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon, color }) => (
        <div
          key={label}
          className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-md`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-80">{label}</span>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-sm opacity-70">{sub}</div>
        </div>
      ))}
    </div>
  );
}
