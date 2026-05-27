'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types';
import {
  loadExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
  }, []);

  const add = useCallback((input: ExpenseInput) => {
    const expense: Expense = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(addExpense(expense));
    return expense;
  }, []);

  const update = useCallback((expense: Expense) => {
    setExpenses(updateExpense(expense));
  }, []);

  const remove = useCallback((id: string) => {
    setExpenses(deleteExpense(id));
  }, []);

  return { expenses, isLoaded, add, update, remove };
}
