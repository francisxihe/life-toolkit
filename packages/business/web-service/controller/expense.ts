import { request } from '../request';
import type { BudgetVo, CreateBudgetVo, CreateTransactionVo, TransactionVo } from '@true-north/vo';

export default class ExpenseController {
  static async listTransactions() {
    return request<{ list: TransactionVo[] }>({ method: 'get' })('/expense/transactions');
  }

  static async createTransaction(body: CreateTransactionVo) {
    return request<TransactionVo>({ method: 'post' })('/expense/transactions', body);
  }

  static async updateTransaction(id: string, body: Partial<CreateTransactionVo>) {
    return request<TransactionVo>({ method: 'put' })(`/expense/transactions/${id}`, body);
  }

  static async deleteTransaction(id: string) {
    return request<boolean>({ method: 'remove' })(`/expense/transactions/${id}`);
  }

  static async listBudgets() {
    return request<{ list: BudgetVo[] }>({ method: 'get' })('/expense/budgets');
  }

  static async createBudget(body: CreateBudgetVo) {
    return request<BudgetVo>({ method: 'post' })('/expense/budgets', body);
  }

  static async updateBudget(id: string, body: Partial<CreateBudgetVo>) {
    return request<BudgetVo>({ method: 'put' })(`/expense/budgets/${id}`, body);
  }

  static async deleteBudget(id: string) {
    return request<boolean>({ method: 'remove' })(`/expense/budgets/${id}`);
  }
}
