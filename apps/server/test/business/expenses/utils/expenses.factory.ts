import { Transaction } from '../../../../src/business/expenses/entities/transaction.entity';
import { Budget } from '../../../../src/business/expenses/entities/budget.entity';
import { User } from '../../../../src/business/users/entities/user.entity';

/**
 * 支出模块测试数据工厂
 */
export class ExpensesTestFactory {
  /**
   * 创建基础交易DTO
   */
  static createBasicTransactionDto(overrides?: Partial<any>): Record<string, any> {
    return {
      type: 'expense',
      amount: 100.50,
      description: '午餐费用',
      category: '餐饮',
      tags: ['工作日', '午餐'],
      date: new Date('2024-01-01'),
      repeat: null,
      ...overrides,
    };
  }

  /**
   * 创建交易实体
   */
  static createTransactionEntity(overrides?: Partial<Transaction>): Transaction {
    const transaction = new Transaction();
    transaction.id = 1;
    transaction.type = 'expense';
    transaction.amount = 100.50;
    transaction.description = '午餐费用';
    transaction.category = '餐饮';
    transaction.tags = ['工作日', '午餐'];
    transaction.date = new Date('2024-01-01');
    transaction.repeat = undefined as any;
    transaction.createdAt = new Date('2024-01-01T00:00:00.000Z');
    transaction.updatedAt = new Date('2024-01-01T00:00:00.000Z');
    
    return Object.assign(transaction, overrides);
  }

  /**
   * 创建收入交易
   */
  static createIncomeTransaction(overrides?: Partial<Transaction>): Transaction {
    return this.createTransactionEntity({
      type: 'income',
      amount: 5000,
      description: '工资收入',
      category: '工资',
      tags: ['月薪'],
      ...overrides,
    });
  }

  /**
   * 创建支出交易
   */
  static createExpenseTransaction(overrides?: Partial<Transaction>): Transaction {
    return this.createTransactionEntity({
      type: 'expense',
      amount: 200,
      description: '购物支出',
      category: '购物',
      tags: ['日用品'],
      ...overrides,
    });
  }

  /**
   * 创建基础预算DTO
   */
  static createBasicBudgetDto(overrides?: Partial<any>): Record<string, any> {
    return {
      category: '餐饮',
      amount: 1000,
      period: 'monthly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      spent: 0,
      ...overrides,
    };
  }

  /**
   * 创建预算实体
   */
  static createBudgetEntity(overrides?: Partial<Budget>): Budget {
    const budget = new Budget();
    budget.id = 1;
    budget.category = '餐饮';
    budget.amount = 1000;
    budget.period = 'monthly';
    budget.startDate = new Date('2024-01-01');
    budget.endDate = new Date('2024-01-31');
    budget.spent = 0;
    budget.createdAt = new Date('2024-01-01T00:00:00.000Z');
    budget.updatedAt = new Date('2024-01-01T00:00:00.000Z');
    
    return Object.assign(budget, overrides);
  }

  /**
   * 创建用户实体
   */
  static createUserEntity(overrides?: Partial<User>): User {
    const user = new User();
    user.id = 'user-1';
    user.username = 'testuser';
    user.password = 'password123';
    user.name = '测试用户';
    user.createdAt = new Date('2024-01-01T00:00:00.000Z');
    user.updatedAt = new Date('2024-01-01T00:00:00.000Z');
    
    return Object.assign(user, overrides);
  }

  /**
   * 创建多个交易
   */
  static createMultipleTransactions(count: number): Transaction[] {
    return Array.from({ length: count }, (_, index) =>
      this.createTransactionEntity({
        id: index + 1,
        description: `交易${index + 1}`,
        amount: (index + 1) * 100,
      })
    );
  }

  /**
   * 创建多个预算
   */
  static createMultipleBudgets(count: number): Budget[] {
    const categories = ['餐饮', '交通', '购物', '娱乐', '医疗'];
    return Array.from({ length: count }, (_, index) =>
      this.createBudgetEntity({
        id: index + 1,
        category: categories[index % categories.length],
        amount: (index + 1) * 500,
      })
    );
  }

  /**
   * 创建不同类型的交易列表
   */
  static createMixedTransactions(): Transaction[] {
    return [
      this.createIncomeTransaction({ id: 1, amount: 5000 }),
      this.createExpenseTransaction({ id: 2, amount: 200, category: '餐饮' }),
      this.createExpenseTransaction({ id: 3, amount: 300, category: '交通' }),
      this.createIncomeTransaction({ id: 4, amount: 1000, description: '兼职收入' }),
      this.createExpenseTransaction({ id: 5, amount: 150, category: '娱乐' }),
    ];
  }

  /**
   * 创建重复交易
   */
  static createRecurringTransaction(overrides?: Partial<Transaction>): Transaction {
    return this.createTransactionEntity({
      repeat: {
        frequency: 'monthly',
        interval: 1,
      },
      description: '房租',
      amount: 2000,
      category: '住房',
      ...overrides,
    });
  }

  /**
   * 创建边界值测试数据
   */
  static createBoundaryTestData() {
    return {
      minAmount: this.createBasicTransactionDto({
        amount: 0.01,
        description: '最小金额',
      }),
      maxAmount: this.createBasicTransactionDto({
        amount: 999999.99,
        description: '最大金额',
      }),
      longDescription: this.createBasicTransactionDto({
        description: '这是一个非常长的描述'.repeat(10),
      }),
      manyTags: this.createBasicTransactionDto({
        tags: Array.from({ length: 20 }, (_, i) => `标签${i + 1}`),
      }),
    };
  }

  /**
   * 创建统计测试数据
   */
  static createStatsTestData(): Transaction[] {
    return [
      this.createIncomeTransaction({ amount: 5000, category: '工资' }),
      this.createIncomeTransaction({ amount: 1000, category: '兼职' }),
      this.createExpenseTransaction({ amount: 500, category: '餐饮' }),
      this.createExpenseTransaction({ amount: 300, category: '交通' }),
      this.createExpenseTransaction({ amount: 200, category: '餐饮' }),
    ];
  }

  /**
   * 创建随机交易
   */
  static createRandomTransaction(): Record<string, any> {
    const types = ['income', 'expense'];
    const categories = ['餐饮', '交通', '购物', '娱乐', '工资', '兼职'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomAmount = Math.floor(Math.random() * 1000) + 1;

    return this.createBasicTransactionDto({
      type: randomType,
      category: randomCategory,
      amount: randomAmount,
      description: `随机${randomType === 'income' ? '收入' : '支出'}`,
    });
  }
} 