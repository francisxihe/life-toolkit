'use client';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  date: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
}

export interface Budget {
  id: number;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  spent: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

export interface TransactionFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  type?: TransactionType;
  categories: string[];
  tags: string[];
  period: 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  categoryBreakdown: Record<string, number>;
  periodComparison: {
    current: number;
    previous: number;
    change: number;
  };
}
