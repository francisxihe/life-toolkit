import { Body, Controller, Delete, Get, Param, Post, Put } from '@true-north/plugin-sdk/main';
import type { BudgetVo, CreateBudgetVo, CreateTransactionVo, TransactionVo } from '@true-north/vo';
import { expenseService } from './expense.service';

@Controller('/expense')
export class ExpenseController {
  @Get('/transactions', { description: '交易列表' })
  async listTransactions(): Promise<{ list: TransactionVo[] }> {
    return { list: await expenseService.listTransactions() };
  }

  @Post('/transactions', { description: '创建交易' })
  async createTransaction(@Body() body: CreateTransactionVo): Promise<TransactionVo> {
    return expenseService.createTransaction(body);
  }

  @Put('/transactions/:id', { description: '更新交易' })
  async updateTransaction(@Param('id') id: string, @Body() body: Partial<CreateTransactionVo>): Promise<TransactionVo> {
    return expenseService.updateTransaction(id, body);
  }

  @Delete('/transactions/:id', { description: '删除交易' })
  async deleteTransaction(@Param('id') id: string): Promise<boolean> {
    return expenseService.deleteTransaction(id);
  }

  @Get('/budgets', { description: '预算列表' })
  async listBudgets(): Promise<{ list: BudgetVo[] }> {
    return { list: await expenseService.listBudgets() };
  }

  @Post('/budgets', { description: '创建预算' })
  async createBudget(@Body() body: CreateBudgetVo): Promise<BudgetVo> {
    return expenseService.createBudget(body);
  }

  @Put('/budgets/:id', { description: '更新预算' })
  async updateBudget(@Param('id') id: string, @Body() body: Partial<CreateBudgetVo>): Promise<BudgetVo> {
    return expenseService.updateBudget(id, body);
  }

  @Delete('/budgets/:id', { description: '删除预算' })
  async deleteBudget(@Param('id') id: string): Promise<boolean> {
    return expenseService.deleteBudget(id);
  }
}
