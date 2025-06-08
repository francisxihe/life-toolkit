import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpensesService } from '../../../../src/business/expenses/expenses.service';
import { Transaction } from '../../../../src/business/expenses/entities/transaction.entity';
import { Budget } from '../../../../src/business/expenses/entities/budget.entity';
import { ExpensesTestFactory } from '../utils/expenses.factory';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let transactionRepository: Repository<Transaction>;
  let budgetRepository: Repository<Budget>;

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockBudgetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Budget),
          useValue: mockBudgetRepository,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    budgetRepository = module.get<Repository<Budget>>(getRepositoryToken(Budget));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const transactionDto = ExpensesTestFactory.createBasicTransactionDto();
      const expectedTransaction = ExpensesTestFactory.createTransactionEntity();

      mockTransactionRepository.create.mockReturnValue(expectedTransaction);
      mockTransactionRepository.save.mockResolvedValue(expectedTransaction);

      const result = await service.createTransaction(transactionDto, user);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(transactionDto);
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(expectedTransaction);
      expect(result).toEqual(expectedTransaction);
    });

    it('should create expense transaction and update budget', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const expenseDto = ExpensesTestFactory.createBasicTransactionDto({
        type: 'expense',
        amount: 100,
        category: '餐饮',
      });
      const transaction = ExpensesTestFactory.createExpenseTransaction({
        amount: 100,
        category: '餐饮',
      });
      const budget = ExpensesTestFactory.createBudgetEntity({
        category: '餐饮',
        spent: 200,
      });

      mockTransactionRepository.create.mockReturnValue(transaction);
      mockTransactionRepository.save.mockResolvedValue(transaction);
      mockBudgetRepository.findOne.mockResolvedValue(budget);
      mockBudgetRepository.save.mockResolvedValue({ ...budget, spent: 300 });

      const result = await service.createTransaction(expenseDto, user);

      expect(mockBudgetRepository.findOne).toHaveBeenCalled();
      expect(mockBudgetRepository.save).toHaveBeenCalledWith({
        ...budget,
        spent: 300,
      });
      expect(result).toEqual(transaction);
    });

    it('should create income transaction without updating budget', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const incomeDto = ExpensesTestFactory.createBasicTransactionDto({
        type: 'income',
        amount: 5000,
      });
      const transaction = ExpensesTestFactory.createIncomeTransaction();

      mockTransactionRepository.create.mockReturnValue(transaction);
      mockTransactionRepository.save.mockResolvedValue(transaction);

      const result = await service.createTransaction(incomeDto, user);

      expect(mockBudgetRepository.findOne).not.toHaveBeenCalled();
      expect(mockBudgetRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(transaction);
    });
  });

  describe('createBudget', () => {
    it('should create a new budget', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const budgetDto = ExpensesTestFactory.createBasicBudgetDto();
      const expectedBudget = ExpensesTestFactory.createBudgetEntity();

      mockBudgetRepository.create.mockReturnValue(expectedBudget);
      mockBudgetRepository.save.mockResolvedValue(expectedBudget);

      const result = await service.createBudget(budgetDto, user);

      expect(mockBudgetRepository.create).toHaveBeenCalledWith(budgetDto);
      expect(mockBudgetRepository.save).toHaveBeenCalledWith(expectedBudget);
      expect(result).toEqual(expectedBudget);
    });

    it('should create budget with custom data', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const customBudgetDto = ExpensesTestFactory.createBasicBudgetDto({
        category: '交通',
        amount: 500,
      });
      const expectedBudget = ExpensesTestFactory.createBudgetEntity({
        category: '交通',
        amount: 500,
      });

      mockBudgetRepository.create.mockReturnValue(expectedBudget);
      mockBudgetRepository.save.mockResolvedValue(expectedBudget);

      const result = await service.createBudget(customBudgetDto, user);

      expect(result.category).toBe('交通');
      expect(result.amount).toBe(500);
    });
  });

  describe('findAllTransactions', () => {
    it('should return all transactions ordered by date', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const transactions = ExpensesTestFactory.createMultipleTransactions(3);

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.findAllTransactions(user);

      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        order: { date: 'DESC' },
      });
      expect(result).toEqual(transactions);
    });

    it('should return empty array when no transactions', async () => {
      const user = ExpensesTestFactory.createUserEntity();

      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.findAllTransactions(user);

      expect(result).toEqual([]);
    });
  });

  describe('findAllBudgets', () => {
    it('should return all budgets', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const budgets = ExpensesTestFactory.createMultipleBudgets(3);

      mockBudgetRepository.find.mockResolvedValue(budgets);

      const result = await service.findAllBudgets(user);

      expect(mockBudgetRepository.find).toHaveBeenCalledWith({});
      expect(result).toEqual(budgets);
    });

    it('should return empty array when no budgets', async () => {
      const user = ExpensesTestFactory.createUserEntity();

      mockBudgetRepository.find.mockResolvedValue([]);

      const result = await service.findAllBudgets(user);

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should calculate correct statistics', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const transactions = ExpensesTestFactory.createStatsTestData();

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getStats(user);

      expect(result.totalIncome).toBe(6000); // 5000 + 1000
      expect(result.totalExpenses).toBe(1000); // 500 + 300 + 200
      expect(result.netAmount).toBe(5000); // 6000 - 1000
      expect(result.categoryBreakdown).toEqual({
        '工资': 5000,
        '兼职': 1000,
        '餐饮': 700, // 500 + 200
        '交通': 300,
      });
    });

    it('should handle empty transactions', async () => {
      const user = ExpensesTestFactory.createUserEntity();

      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.getStats(user);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netAmount).toBe(0);
      expect(result.categoryBreakdown).toEqual({});
    });

    it('should handle only income transactions', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const incomeTransactions = [
        ExpensesTestFactory.createIncomeTransaction({ amount: 3000 }),
        ExpensesTestFactory.createIncomeTransaction({ amount: 2000 }),
      ];

      mockTransactionRepository.find.mockResolvedValue(incomeTransactions);

      const result = await service.getStats(user);

      expect(result.totalIncome).toBe(5000);
      expect(result.totalExpenses).toBe(0);
      expect(result.netAmount).toBe(5000);
    });

    it('should handle only expense transactions', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const expenseTransactions = [
        ExpensesTestFactory.createExpenseTransaction({ amount: 300 }),
        ExpensesTestFactory.createExpenseTransaction({ amount: 200 }),
      ];

      mockTransactionRepository.find.mockResolvedValue(expenseTransactions);

      const result = await service.getStats(user);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(500);
      expect(result.netAmount).toBe(-500);
    });
  });

  describe('边界测试', () => {
    it('should handle boundary test data', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const boundaryData = ExpensesTestFactory.createBoundaryTestData();
      const transaction = ExpensesTestFactory.createTransactionEntity();

      mockTransactionRepository.create.mockReturnValue(transaction);
      mockTransactionRepository.save.mockResolvedValue(transaction);

      const minResult = await service.createTransaction(boundaryData.minAmount, user);
      const maxResult = await service.createTransaction(boundaryData.maxAmount, user);

      expect(minResult).toBeDefined();
      expect(maxResult).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('错误处理', () => {
    it('should handle repository errors', async () => {
      const user = ExpensesTestFactory.createUserEntity();
      const transactionDto = ExpensesTestFactory.createBasicTransactionDto();
      const error = new Error('Database error');

      mockTransactionRepository.create.mockReturnValue({});
      mockTransactionRepository.save.mockRejectedValue(error);

      await expect(service.createTransaction(transactionDto, user)).rejects.toThrow('Database error');
    });
  });
}); 