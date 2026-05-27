export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
}

export interface ExpenseFilters {
  startDate: string;
  endDate: string;
  category: Category | 'All';
  searchQuery: string;
}
