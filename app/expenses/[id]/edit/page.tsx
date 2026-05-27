'use client';

import { use } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import ExpenseForm from '@/components/ExpenseForm';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditExpensePage({ params }: Props) {
  const { id } = use(params);
  const { expenses, isLoaded, update } = useExpenses();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-slate-600 font-medium">Expense not found</p>
        <Link href="/expenses" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Back to expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Edit Expense</h1>
        <p className="text-slate-500 text-sm mt-0.5">Update the expense details</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <ExpenseForm
          initial={expense}
          onSubmit={(data) => update({ ...expense, ...data })}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
