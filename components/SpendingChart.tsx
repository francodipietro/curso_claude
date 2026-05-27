'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Expense } from '@/lib/types';
import { groupByCategory, groupByMonth, formatCurrency } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface Props {
  expenses: Expense[];
}

function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      <p className="text-slate-800 font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
      <p className="font-medium text-slate-700">{payload[0].name}</p>
      <p className="text-slate-800 font-bold">{formatCurrency(payload[0].value)}</p>
      <p className="text-slate-500 text-sm">{payload[0].payload.percent}</p>
    </div>
  );
}

export default function SpendingChart({ expenses }: Props) {
  const monthlyData = groupByMonth(expenses);
  const categoryData = groupByCategory(expenses);

  const total = Object.values(categoryData).reduce((s, v) => s + v, 0);
  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    percent: total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%',
    color: CATEGORY_CONFIG[name as keyof typeof CATEGORY_CONFIG]?.chartColor ?? '#6b7280',
  }));

  if (expenses.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['Monthly Spending', 'Spending by Category'].map((title) => (
          <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No expense data yet
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Monthly Spending</h3>
        {monthlyData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Spending by Category</h3>
        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: '#475569' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
