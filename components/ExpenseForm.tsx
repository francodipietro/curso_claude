'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface Props {
  initial?: Expense;
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  submitLabel?: string;
}

interface Errors {
  date?: string;
  amount?: string;
  description?: string;
}

export default function ExpenseForm({ initial, onSubmit, submitLabel = 'Add Expense' }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: initial?.date ?? today,
    amount: initial?.amount?.toString() ?? '',
    category: initial?.category ?? ('Food' as Category),
    description: initial?.description ?? '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date,
        amount: initial.amount.toString(),
        category: initial.category,
        description: initial.description,
      });
    }
  }, [initial]);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.date) e.date = 'Date is required';
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount greater than 0';
    if (form.description.trim().length < 2) e.description = 'Description must be at least 2 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      date: form.date,
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      category: form.category,
      description: form.description.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      router.push('/expenses');
    }, 600);
  }

  const cfg = CATEGORY_CONFIG[form.category];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <span>✓</span> Expense saved! Redirecting…
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
        <input
          type="date"
          value={form.date}
          max={today}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.date ? 'border-red-400' : 'border-slate-200'
          }`}
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className={`w-full pl-7 pr-4 py-2.5 rounded-xl border text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.amount ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        </div>
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const c = CATEGORY_CONFIG[cat];
            const active = form.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                  active
                    ? `${c.bgColor} ${c.color} border-current`
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">{c.icon}</span>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <input
          type="text"
          placeholder="What did you spend on?"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.description ? 'border-red-400' : 'border-slate-200'
          }`}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitted}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition disabled:opacity-60"
        >
          {submitted ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
