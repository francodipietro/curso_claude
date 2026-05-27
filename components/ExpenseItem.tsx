'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface Props {
  expense: Expense;
  onDelete: (id: string) => void;
}

export default function ExpenseItem({ expense, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const cfg = CATEGORY_CONFIG[expense.category];

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className={`w-10 h-10 rounded-xl ${cfg.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color}`}>
            {expense.category}
          </span>
          <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-bold text-slate-800">{formatCurrency(expense.amount)}</span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/expenses/${expense.id}/edit`}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            title="Edit"
          >
            ✏️
          </Link>
          {confirming ? (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(expense.id)}
                className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
