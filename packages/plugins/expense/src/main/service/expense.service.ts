import dayjs from 'dayjs';
import type { EntityManager } from 'typeorm';
import { store } from '../storage';
import { ExpenseTransaction } from './transaction.entity';
import { ExpenseBudget } from './budget.entity';
import type {
  BudgetVo,
  CreateBudgetVo,
  CreateTransactionVo,
  TransactionVo,
} from '@true-north/vo';
import { recordDomainActivity } from '../ports';

function toIso(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toTransactionVo(entity: ExpenseTransaction): TransactionVo {
  return {
    id: entity.id,
    type: entity.type,
    amount: entity.amount,
    description: entity.description || '',
    category: entity.category,
    tags: entity.tags || [],
    transactionDateTime: toIso(entity.transactionDateTime),
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

function budgetSpent(category: string, transactions: ExpenseTransaction[]): number {
  return transactions
    .filter((item) => item.category === category && item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
}

function toBudgetVo(entity: ExpenseBudget, spent: number): BudgetVo {
  return {
    id: entity.id,
    category: entity.category,
    amount: entity.amount,
    period: entity.period,
    startDate: dayjs(entity.startDate).format('YYYY-MM-DD'),
    endDate: entity.endDate ? dayjs(entity.endDate).format('YYYY-MM-DD') : undefined,
    spent,
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

export class ExpenseService {
  private transactions(manager?: EntityManager) {
    return (manager ?? store().manager).getRepository(ExpenseTransaction);
  }

  private budgets(manager?: EntityManager) {
    return (manager ?? store().manager).getRepository(ExpenseBudget);
  }

  async listTransactions(): Promise<TransactionVo[]> {
    const list = await this.transactions().find({
      where: { deletedAt: undefined },
      order: { transactionDateTime: 'DESC' },
    });
    return list.map(toTransactionVo);
  }

  async createTransaction(
    body: CreateTransactionVo,
    options?: { skipActivity?: boolean; manager?: EntityManager }
  ): Promise<TransactionVo> {
    if (!body?.amount || body.amount <= 0) throw new Error('金额必须大于 0');
    if (!body.category?.trim()) throw new Error('请选择分类');
    const repo = this.transactions(options?.manager);
    const entity = repo.create({
      type: body.type || 'expense',
      amount: Number(body.amount),
      description: body.description,
      category: body.category,
      tags: body.tags || [],
      transactionDateTime: body.transactionDateTime
        ? new Date(body.transactionDateTime)
        : new Date(),
    });
    const saved = await repo.save(entity);
    const vo = toTransactionVo(saved);
    if (!options?.skipActivity) {
      await recordDomainActivity({
        title: vo.description || (vo.type === 'income' ? '收入' : '支出'),
        summary: `${vo.type === 'income' ? '+' : '-'}${vo.amount}`,
        source: 'domain',
        links: [{ domain: 'expense', entityId: vo.id, role: 'expense', label: vo.description }],
      });
    }
    return vo;
  }

  async updateTransaction(id: string, body: Partial<CreateTransactionVo>): Promise<TransactionVo> {
    const current = await this.transactions().findOneBy({ id });
    if (!current) throw new Error('交易不存在');
    if (body.type) current.type = body.type;
    if (body.amount != null) current.amount = Number(body.amount);
    if (body.description !== undefined) current.description = body.description;
    if (body.category) current.category = body.category;
    if (body.tags) current.tags = body.tags;
    if (body.transactionDateTime) current.transactionDateTime = new Date(body.transactionDateTime);
    return toTransactionVo(await this.transactions().save(current));
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.transactions().softDelete(id);
    const { unlinkDomain } = await import('../ports');
    await unlinkDomain('expense', id);
    return true;
  }

  async listBudgets(): Promise<BudgetVo[]> {
    const [budgets, transactions] = await Promise.all([
      this.budgets().find({ where: { deletedAt: undefined }, order: { createdAt: 'DESC' } }),
      this.transactions().find({ where: { deletedAt: undefined } }),
    ]);
    return budgets.map((item) => toBudgetVo(item, budgetSpent(item.category, transactions)));
  }

  async createBudget(body: CreateBudgetVo): Promise<BudgetVo> {
    if (!body?.category?.trim()) throw new Error('请选择分类');
    if (!body.amount || body.amount <= 0) throw new Error('预算金额必须大于 0');
    const entity = this.budgets().create({
      category: body.category,
      amount: Number(body.amount),
      period: body.period || 'monthly',
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
    const saved = await this.budgets().save(entity);
    return toBudgetVo(saved, 0);
  }

  async updateBudget(id: string, body: Partial<CreateBudgetVo>): Promise<BudgetVo> {
    const current = await this.budgets().findOneBy({ id });
    if (!current) throw new Error('预算不存在');
    if (body.category) current.category = body.category;
    if (body.amount != null) current.amount = Number(body.amount);
    if (body.period) current.period = body.period;
    if (body.startDate) current.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) current.endDate = body.endDate ? new Date(body.endDate) : undefined;
    const saved = await this.budgets().save(current);
    const transactions = await this.transactions().find({ where: { deletedAt: undefined } });
    return toBudgetVo(saved, budgetSpent(saved.category, transactions));
  }

  async deleteBudget(id: string): Promise<boolean> {
    await this.budgets().softDelete(id);
    return true;
  }
}

export const expenseService = new ExpenseService();
