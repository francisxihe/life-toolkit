"use client";

import { BaseEntityVo } from "../common";

export type TransactionType = "income" | "expense";

export interface TransactionModelVo {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  transactionDateTime: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
  };
}

export type TransactionVo = BaseEntityVo & TransactionModelVo;

export type CreateTransactionVo = Omit<TransactionModelVo, "recurring">;

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

export type TransactionFilters = {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  type?: TransactionType;
  categories: string[];
  tags: string[];
  period: "all" | "daily" | "weekly" | "monthly" | "yearly";
}

export type TransactionStats = {
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
