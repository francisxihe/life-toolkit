import { BaseEntityVo } from '../common';

export interface BudgetModelVo {
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  spent: number;
}

export type BudgetVo = BaseEntityVo & BudgetModelVo;

export type CreateBudgetVo = Omit<BudgetModelVo, 'spent'>;
