'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  Transaction,
  Budget,
  TransactionFilters,
  TransactionStats,
} from '../types';

interface ExpensesContextType {
  transactions: Transaction[];
  budgets: Budget[];
  filters: TransactionFilters;
  stats: TransactionStats;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: number, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: number) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: number, updates: Partial<Budget>) => void;
  deleteBudget: (id: number) => void;
  setFilters: (filters: TransactionFilters) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(
  undefined
);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: {
      from: undefined,
      to: undefined,
    },
    categories: [],
    tags: [],
    period: 'all',
  });

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions((prev) => [...prev, { ...transaction, id: Date.now() }]);
  }, []);

  const updateTransaction = useCallback(
    (id: number, updates: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        )
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  }, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'spent'>) => {
    setBudgets((prev) => [...prev, { ...budget, id: Date.now(), spent: 0 }]);
  }, []);

  const updateBudget = useCallback((id: number, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === id ? { ...budget, ...updates } : budget
      )
    );
  }, []);

  const deleteBudget = useCallback((id: number) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  }, []);

  const stats = useMemo(() => {
    const filteredTransactions = transactions.filter((transaction) => {
      if (filters.dateRange.from && filters.dateRange.to) {
        const transactionDate = new Date(transaction.date);
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

    const categoryBreakdown = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

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
  }, [transactions, filters]);

  const value = useMemo(
    () => ({
      transactions,
      budgets,
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
      transactions,
      budgets,
      filters,
      stats,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
    ]
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
