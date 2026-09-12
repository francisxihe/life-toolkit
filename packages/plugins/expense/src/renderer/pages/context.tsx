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
} from '@true-north/vo';
import { ExpenseController } from '../../client';
import { useEffect } from 'react';
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

  useEffect(() => {
    void Promise.all([ExpenseController.listTransactions(), ExpenseController.listBudgets()]).then(
      ([transactions, budgets]) => {
        setTransactions(transactions?.list || []);
        setBudgetList(budgets?.list || []);
      },
    );
  }, []);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: {
      from: undefined,
      to: undefined,
    },
    categories: [],
    tags: [],
    period: 'all',
  });

  const addTransaction = useCallback((transaction: CreateTransactionVo) => {
    void ExpenseController.createTransaction(transaction).then((created) => {
      if (created) setTransactions((prev) => [created, ...prev]);
    });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<TransactionVo>) => {
    void ExpenseController.updateTransaction(id, updates).then((updated) => {
      if (updated) {
        setTransactions((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    void ExpenseController.deleteTransaction(id).then(() => {
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    });
  }, []);

  const addBudget = useCallback((budget: CreateBudgetVo) => {
    void ExpenseController.createBudget(budget).then((created) => {
      if (created) setBudgetList((prev) => [created, ...prev]);
    });
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<BudgetVo>) => {
    void ExpenseController.updateBudget(id, updates).then((updated) => {
      if (updated) setBudgetList((prev) => prev.map((item) => (item.id === id ? updated : item)));
    });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    void ExpenseController.deleteBudget(id).then(() => {
      setBudgetList((prev) => prev.filter((budget) => budget.id !== id));
    });
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
