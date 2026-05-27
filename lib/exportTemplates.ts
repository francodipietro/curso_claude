import { Expense } from './types';
import { formatCurrency, formatShortDate } from './utils';
import { CATEGORY_CONFIG } from './categories';
import { format, parseISO, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  formats: ('CSV' | 'PDF' | 'JSON')[];
  badge?: string;
  build: (expenses: Expense[]) => TemplateData;
}

export interface TemplateData {
  title: string;
  subtitle: string;
  headers: string[];
  rows: string[][];
  summary: Record<string, string>;
}

function thisYear(expenses: Expense[]) {
  const now = new Date();
  return expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start: startOfYear(now), end: endOfYear(now) })
  );
}

function thisMonth(expenses: Expense[]) {
  const now = new Date();
  return expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start: startOfMonth(now), end: endOfMonth(now) })
  );
}

export const TEMPLATES: ExportTemplate[] = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    description: 'Annual expenses grouped by category — ready to hand to an accountant.',
    icon: '🧾',
    accent: 'from-blue-600 to-blue-800',
    formats: ['PDF', 'CSV'],
    badge: 'Popular',
    build(expenses) {
      const data = thisYear(expenses);
      const total = data.reduce((s, e) => s + e.amount, 0);
      const byCategory: Record<string, { count: number; total: number }> = {};
      data.forEach((e) => {
        if (!byCategory[e.category]) byCategory[e.category] = { count: 0, total: 0 };
        byCategory[e.category].count++;
        byCategory[e.category].total += e.amount;
      });
      return {
        title: `Tax Report ${new Date().getFullYear()}`,
        subtitle: `${data.length} deductible expenses`,
        headers: ['Category', 'Transactions', 'Total', '% of Spend'],
        rows: Object.entries(byCategory)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([cat, v]) => [
            cat,
            String(v.count),
            formatCurrency(v.total),
            total > 0 ? `${((v.total / total) * 100).toFixed(1)}%` : '0%',
          ]),
        summary: {
          'Total Expenses': formatCurrency(total),
          'Transaction Count': String(data.length),
          'Top Category': Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total)[0]?.[0] ?? '—',
          'Reporting Period': `Jan – Dec ${new Date().getFullYear()}`,
        },
      };
    },
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    description: 'Month-by-month spending breakdown for the past 12 months.',
    icon: '📅',
    accent: 'from-purple-600 to-purple-800',
    formats: ['PDF', 'CSV'],
    build(expenses) {
      const map: Record<string, { count: number; total: number }> = {};
      expenses.forEach((e) => {
        const m = e.date.slice(0, 7);
        if (!map[m]) map[m] = { count: 0, total: 0 };
        map[m].count++;
        map[m].total += e.amount;
      });
      const rows = Object.entries(map)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 12)
        .map(([month, v]) => [
          format(parseISO(`${month}-01`), 'MMMM yyyy'),
          String(v.count),
          formatCurrency(v.total),
          v.count > 0 ? formatCurrency(v.total / v.count) : '—',
        ]);
      return {
        title: 'Monthly Spending Summary',
        subtitle: 'Last 12 months',
        headers: ['Month', 'Transactions', 'Total', 'Avg per Expense'],
        rows,
        summary: {
          'Months Covered': String(rows.length),
          'Total Spent': formatCurrency(expenses.reduce((s, e) => s + e.amount, 0)),
          'Avg Monthly': rows.length
            ? formatCurrency(
                rows.reduce((s, r) => s + parseFloat(r[2].replace(/[$,]/g, '')), 0) / rows.length
              )
            : '—',
        },
      };
    },
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    description: 'Deep-dive into spending patterns across all categories.',
    icon: '🎯',
    accent: 'from-emerald-600 to-emerald-800',
    formats: ['PDF', 'CSV', 'JSON'],
    build(expenses) {
      const total = expenses.reduce((s, e) => s + e.amount, 0);
      const byCategory: Record<string, { count: number; total: number; max: number; min: number }> = {};
      expenses.forEach((e) => {
        if (!byCategory[e.category])
          byCategory[e.category] = { count: 0, total: 0, max: 0, min: Infinity };
        byCategory[e.category].count++;
        byCategory[e.category].total += e.amount;
        byCategory[e.category].max = Math.max(byCategory[e.category].max, e.amount);
        byCategory[e.category].min = Math.min(byCategory[e.category].min, e.amount);
      });
      return {
        title: 'Category Analysis',
        subtitle: 'All-time spending breakdown',
        headers: ['Category', 'Count', 'Total', 'Average', 'Max', 'Share'],
        rows: Object.entries(byCategory)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([cat, v]) => [
            cat,
            String(v.count),
            formatCurrency(v.total),
            formatCurrency(v.total / v.count),
            formatCurrency(v.max),
            total > 0 ? `${((v.total / total) * 100).toFixed(1)}%` : '0%',
          ]),
        summary: {
          'Total Spent': formatCurrency(total),
          'Categories Active': String(Object.keys(byCategory).length),
          'Total Transactions': String(expenses.length),
        },
      };
    },
  },
  {
    id: 'business-expenses',
    name: 'Business Expenses',
    description: 'Bills and Transportation filtered for reimbursement reports.',
    icon: '💼',
    accent: 'from-orange-600 to-orange-800',
    formats: ['PDF', 'CSV'],
    build(expenses) {
      const data = expenses.filter((e) =>
        ['Bills', 'Transportation', 'Food'].includes(e.category)
      );
      return {
        title: 'Business Expense Report',
        subtitle: 'Bills, Transportation & Food',
        headers: ['Date', 'Category', 'Amount', 'Description'],
        rows: data.map((e) => [
          formatShortDate(e.date),
          e.category,
          formatCurrency(e.amount),
          e.description,
        ]),
        summary: {
          'Total Billable': formatCurrency(data.reduce((s, e) => s + e.amount, 0)),
          'Transactions': String(data.length),
        },
      };
    },
  },
  {
    id: 'full-export',
    name: 'Full Data Export',
    description: 'Complete raw export of every expense, all fields included.',
    icon: '💾',
    accent: 'from-slate-600 to-slate-800',
    formats: ['CSV', 'JSON', 'PDF'],
    badge: 'Backup',
    build(expenses) {
      return {
        title: 'Full Data Export',
        subtitle: `All ${expenses.length} expenses`,
        headers: ['Date', 'Category', 'Amount', 'Description'],
        rows: expenses.map((e) => [
          formatShortDate(e.date),
          e.category,
          formatCurrency(e.amount),
          e.description,
        ]),
        summary: {
          'Total Records': String(expenses.length),
          'Total Amount': formatCurrency(expenses.reduce((s, e) => s + e.amount, 0)),
          'Exported At': new Date().toLocaleString(),
        },
      };
    },
  },
];
