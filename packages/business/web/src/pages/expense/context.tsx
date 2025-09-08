'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { TransactionFilters, TransactionStats } from './types';
import {
  TransactionVo,
  CreateTransactionVo,
  BudgetVo,
  CreateBudgetVo,
} from '@life-toolkit/vo';
import dayjs from 'dayjs';
interface ExpensesContextType {
  transactionList: TransactionVo[];
  budgetList: BudgetVo[];
  filters: TransactionFilters;
  stats: TransactionStats;
  addTransaction: (transaction: CreateTransactionVo) => void;
  updateTransaction: (id: string, updates: Partial<TransactionVo>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: CreateBudgetVo) => void;
  updateBudget: (id: string, updates: Partial<BudgetVo>) => void;
  deleteBudget: (id: string) => void;
  setFilters: (filters: TransactionFilters) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(
  undefined,
);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [transactionList, setTransactions] = useState<TransactionVo[]>([]);
  const [budgetList, setBudgetList] = useState<BudgetVo[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: {
      from: undefined,
      to: undefined,
    },
    categories: [],
    tags: [],
    period: 'all',
  });

  const addTransaction = useCallback(
    (transaction: CreateTransactionVo) => {
      console.log('transaction', transaction);
      setTransactions((prev) => [
        ...prev,
        {
          ...transaction,
          id: Date.now().toString(),
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        },
      ]);
    },
    [],
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<TransactionVo>) => {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id ? { ...transaction, ...updates } : transaction,
        ),
      );
    },
    [],
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );
  }, []);

  const addBudget = useCallback((budget: CreateBudgetVo) => {
    setBudgetList((prev) => [
      ...prev,
      {
        ...budget,
        id: Date.now().toString(),
        spent: 0,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
    ]);
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<BudgetVo>) => {
    setBudgetList((prev) =>
      prev.map((budget) =>
        budget.id === id ? { ...budget, ...updates } : budget,
      ),
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgetList((prev) => prev.filter((budget) => budget.id !== id));
  }, []);

  const stats = useMemo(() => {
    const filteredTransactions = transactionList.filter((transaction) => {
      if (filters.dateRange.from && filters.dateRange.to) {
        const transactionDate = new Date(transaction.transactionDateTime);
        if (
          transactionDate < filters.dateRange.from ||
          transactionDate > filters.dateRange.to
        ) {
          return false;
        }
      }

      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(transaction.category)
      ) {
        return false;
      }

      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => transaction.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    });

    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = filteredTransactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate period comparison
    const currentTotal = totalIncome - totalExpenses;
    const previousTotal = 0; // TODO: Implement previous period calculation

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      categoryBreakdown,
      periodComparison: {
        current: currentTotal,
        previous: previousTotal,
        change: previousTotal
          ? ((currentTotal - previousTotal) / previousTotal) * 100
          : 0,
      },
    };
  }, [transactionList, filters]);

  const value = useMemo(
    () => ({
      transactionList,
      budgetList,
      filters,
      stats,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      setFilters,
    }),
    [
      transactionList,
      budgetList,
      filters,
      stats,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
    ],
  );

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
}
