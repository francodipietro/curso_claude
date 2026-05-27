import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const CATEGORY_CONFIG: Record<
  Category,
  { color: string; bgColor: string; icon: string; chartColor: string }
> = {
  Food: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '🍽️',
    chartColor: '#f97316',
  },
  Transportation: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '🚗',
    chartColor: '#3b82f6',
  },
  Entertainment: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: '🎬',
    chartColor: '#a855f7',
  },
  Shopping: {
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    icon: '🛍️',
    chartColor: '#ec4899',
  },
  Bills: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '📄',
    chartColor: '#ef4444',
  },
  Other: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '📦',
    chartColor: '#6b7280',
  },
};
