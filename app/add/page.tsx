'use client';

import { useExpenses } from '@/hooks/useExpenses';
import ExpenseForm from '@/components/ExpenseForm';

export default function AddExpensePage() {
  const { add } = useExpenses();

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add Expense</h1>
        <p className="text-slate-500 text-sm mt-0.5">Record a new expense</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <ExpenseForm onSubmit={add} submitLabel="Add Expense" />
      </div>
    </div>
  );
}
