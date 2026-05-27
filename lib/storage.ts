import { Expense } from './types';

const KEY = 'expense-tracker-data';

export function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Expense): Expense[] {
  const expenses = loadExpenses();
  const updated = [expense, ...expenses];
  saveExpenses(updated);
  return updated;
}

export function updateExpense(updated: Expense): Expense[] {
  const expenses = loadExpenses();
  const list = expenses.map((e) => (e.id === updated.id ? updated : e));
  saveExpenses(list);
  return list;
}

export function deleteExpense(id: string): Expense[] {
  const expenses = loadExpenses();
  const list = expenses.filter((e) => e.id !== id);
  saveExpenses(list);
  return list;
}
