import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Transaction } from "./entities/transaction.entity";
import { Budget } from "./entities/budget.entity";
// import { CreateTransactionDto } from './dto/create-transaction.dto';
// import { CreateBudgetDto } from "./dto/create-budget.dto";
import { User } from "../users/entities/user.entity";

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>
  ) {}

  /** 创建交易 */
  async createTransaction(
    createTransactionDto: Record<string, any>,
    user: User
  ): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
    });

    const savedTransaction = await this.transactionsRepository.save(
      transaction
    );

    // Update related budget if exists
    if (transaction.type === "expense") {
      const budget = await this.budgetsRepository.findOne({
        where: {
          category: transaction.category,
          startDate: Between(new Date(), transaction.date),
        },
      });

      if (budget) {
        budget.spent += transaction.amount;
        await this.budgetsRepository.save(budget);
      }
    }

    return savedTransaction;
  }

  /** 创建预算 */
  async createBudget(
    createBudgetDto: Record<string, any>,
    user: User
  ): Promise<Budget> {
    const budget = this.budgetsRepository.create({
      ...createBudgetDto,
    });
    return this.budgetsRepository.save(budget);
  }

  async findAllTransactions(user: User): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      order: { date: "DESC" },
    });
  }

  async findAllBudgets(user: User): Promise<Budget[]> {
    return this.budgetsRepository.find({
    });
  }

  async getStats(user: User) {
    const transactions = await this.transactionsRepository.find({});

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      categoryBreakdown,
    };
  }
}
