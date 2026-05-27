import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Expense, ExpenseFilters } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MM/dd/yyyy');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  return expenses.filter((expense) => {
    if (filters.category !== 'All' && expense.category !== filters.category) return false;

    if (filters.startDate && expense.date < filters.startDate) return false;
    if (filters.endDate && expense.date > filters.endDate) return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (
        !expense.description.toLowerCase().includes(q) &&
        !expense.category.toLowerCase().includes(q)
      )
        return false;
    }

    return true;
  });
}

export function getMonthlyExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start, end })
  );
}

export function groupByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>
  );
}

export function groupByMonth(expenses: Expense[]): { month: string; total: number }[] {
  const map: Record<string, number> = {};
  expenses.forEach((e) => {
    const month = e.date.slice(0, 7);
    map[month] = (map[month] || 0) + e.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({
      month: format(parseISO(`${month}-01`), 'MMM yyyy'),
      total,
    }));
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map((e) => [
    formatShortDate(e.date),
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
