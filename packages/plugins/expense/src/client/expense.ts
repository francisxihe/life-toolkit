import { pluginIpc } from './port';
import type { BudgetVo, CreateBudgetVo, CreateTransactionVo, TransactionVo } from '@true-north/vo';

export default class ExpenseController {
  static async listTransactions() {
    return pluginIpc().get<{ list: TransactionVo[] }>('/expense/transactions');
  }

  static async createTransaction(body: CreateTransactionVo) {
    return pluginIpc().post<TransactionVo>('/expense/transactions', body);
  }

  static async updateTransaction(id: string, body: Partial<CreateTransactionVo>) {
    return pluginIpc().put<TransactionVo>(`/expense/transactions/${id}`, body);
  }

  static async deleteTransaction(id: string) {
    return pluginIpc().remove<boolean>(`/expense/transactions/${id}`);
  }

  static async listBudgets() {
    return pluginIpc().get<{ list: BudgetVo[] }>('/expense/budgets');
  }

  static async createBudget(body: CreateBudgetVo) {
    return pluginIpc().post<BudgetVo>('/expense/budgets', body);
  }

  static async updateBudget(id: string, body: Partial<CreateBudgetVo>) {
    return pluginIpc().put<BudgetVo>(`/expense/budgets/${id}`, body);
  }

  static async deleteBudget(id: string) {
    return pluginIpc().remove<boolean>(`/expense/budgets/${id}`);
  }
}
