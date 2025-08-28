import { Repository } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Habit } from "../../../../../src/business/growth/habit/entities";
import { Goal } from "../../../../../src/business/growth/goal/entities";
import { TodoRepeat } from "../../../../../src/business/growth/todo/entities";
import { HabitService } from "../../../../../src/business/growth/habit/habit.service";
import { HabitMapper } from "../../../../../src/business/growth/habit/mapper";
import { HabitTestFactory } from "./habit.factory";
import { HabitStatus } from "@life-toolkit/enum";

/**
 * 习惯测试工具类
 */
export class HabitTestUtils {
  /**
   * 创建测试模块
   */
  static async createTestingModule(
    customProviders?: any[]
  ): Promise<TestingModule> {
    const defaultProviders = [
      HabitService,
      {
        provide: getRepositoryToken(Habit),
        useValue: this.createMockRepository(),
      },
      {
        provide: getRepositoryToken(Goal),
        useValue: this.createMockRepository(),
      },
      {
        provide: getRepositoryToken(TodoRepeat),
        useValue: this.createMockRepository(),
      },
      {
        provide: HabitMapper,
        useValue: this.createMockMapper(),
      },
    ];

    const providers = customProviders || defaultProviders;

    return await Test.createTestingModule({
      providers,
    }).compile();
  }

  /**
   * 创建模拟的Repository
   */
  static createMockRepository() {
    return {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findBy: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
      findByIds: jest.fn(),
    };
  }

  /**
   * 创建模拟的Mapper
   */
  static createMockMapper() {
    return {
      toEntity: jest.fn(),
      exportUpdateEntity: jest.fn(),
      toVo: jest.fn(),
      voToDtoFromVo: jest.fn(),
      voToUpdateDtoFromVo: jest.fn(),
    };
  }

  /**
   * 创建模拟的QueryBuilder
   */
  static createMockQueryBuilder(mockData?: any[]) {
    return {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockData || []),
      getManyAndCount: jest
        .fn()
        .mockResolvedValue([mockData || [], mockData?.length || 0]),
      getOne: jest.fn().mockResolvedValue(mockData?.[0] || null),
      getCount: jest.fn().mockResolvedValue(mockData?.length || 0),
    };
  }

  /**
   * 设置Repository的模拟返回值
   */
  static setupRepositoryMocks(
    repository: Repository<any>,
    mockData: {
      findOne?: any;
      findBy?: any[];
      save?: any;
      create?: any;
      update?: any;
      delete?: any;
      queryBuilder?: any;
    }
  ) {
    if (mockData.findOne !== undefined) {
      (repository.findOne as jest.Mock).mockResolvedValue(mockData.findOne);
    }
    if (mockData.findBy !== undefined) {
      (repository.findBy as jest.Mock).mockResolvedValue(mockData.findBy);
    }
    if (mockData.save !== undefined) {
      (repository.save as jest.Mock).mockResolvedValue(mockData.save);
    }
    if (mockData.create !== undefined) {
      (repository.create as jest.Mock).mockReturnValue(mockData.create);
    }
    if (mockData.update !== undefined) {
      (repository.update as jest.Mock).mockResolvedValue(mockData.update);
    }
    if (mockData.delete !== undefined) {
      (repository.delete as jest.Mock).mockResolvedValue(mockData.delete);
    }
    if (mockData.queryBuilder !== undefined) {
      (repository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockData.queryBuilder
      );
    }
  }

  /**
   * 设置Mapper的模拟返回值
   */
  static setupMapperMocks(
    mapper: HabitMapper,
    mockData: {
      toEntity?: any;
      exportUpdateEntity?: any;
      toVo?: any;
      voToDtoFromVo?: any;
      voToUpdateDtoFromVo?: any;
    }
  ) {
    if (mockData.toEntity !== undefined) {
      (mapper.toEntity as jest.Mock).mockReturnValue(mockData.toEntity);
    }
    if (mockData.exportUpdateEntity !== undefined) {
      (mapper.exportUpdateEntity as jest.Mock).mockReturnValue(
        mockData.exportUpdateEntity
      );
    }
    if (mockData.toVo !== undefined) {
      (mapper.toVo as jest.Mock).mockReturnValue(mockData.toVo);
    }
    if (mockData.voToDtoFromVo !== undefined) {
      (mapper.voToDtoFromVo as jest.Mock).mockReturnValue(
        mockData.voToDtoFromVo
      );
    }
    if (mockData.voToUpdateDtoFromVo !== undefined) {
      (mapper.voToUpdateDtoFromVo as jest.Mock).mockReturnValue(
        mockData.voToUpdateDtoFromVo
      );
    }
  }

  /**
   * 验证Repository方法调用
   */
  static expectRepositoryMethodCalled(
    repository: Repository<any>,
    method: string,
    expectedArgs?: any[]
  ) {
    const mockMethod = (repository as any)[method] as jest.Mock;
    expect(mockMethod).toHaveBeenCalled();
    if (expectedArgs) {
      expect(mockMethod).toHaveBeenCalledWith(...expectedArgs);
    }
  }

  /**
   * 验证Mapper方法调用
   */
  static expectMapperMethodCalled(
    mapper: HabitMapper,
    method: string,
    expectedArgs?: any[]
  ) {
    const mockMethod = (mapper as any)[method] as jest.Mock;
    expect(mockMethod).toHaveBeenCalled();
    if (expectedArgs) {
      expect(mockMethod).toHaveBeenCalledWith(...expectedArgs);
    }
  }

  /**
   * 创建成功的测试场景
   */
  static createSuccessScenario(overrides?: any) {
    const habit = HabitTestFactory.createFullHabitVo(overrides);
    return {
      input: HabitTestFactory.createBasicHabitVo(overrides),
      entity: habit,
      output: habit,
      mockData: {
        findOne: habit,
        save: habit,
        create: habit,
        update: { affected: 1 },
        delete: { affected: 1 },
      },
    };
  }

  /**
   * 创建失败的测试场景
   */
  static createFailureScenario(
    errorType: "not_found" | "validation" | "database"
  ) {
    switch (errorType) {
      case "not_found":
        return {
          mockData: { findOne: null },
          expectedError: "NotFoundException",
        };
      case "validation":
        return {
          input: HabitTestFactory.createInvalidHabitVo(),
          expectedError: "BadRequestException",
        };
      case "database":
        return {
          mockData: { save: Promise.reject(new Error("Database error")) },
          expectedError: "Database error",
        };
      default:
        throw new Error(`Unknown error type: ${errorType}`);
    }
  }

  /**
   * 验证习惯对象的基本结构
   */
  static expectHabitStructure(habit: any) {
    expect(habit).toHaveProperty("id");
    expect(habit).toHaveProperty("name");
    expect(habit).toHaveProperty("status");
    expect(habit).toHaveProperty("importance");
    expect(habit).toHaveProperty("tags");
    expect(habit).toHaveProperty("frequency");
    expect(habit).toHaveProperty("difficulty");
    expect(habit).toHaveProperty("currentStreak");
    expect(habit).toHaveProperty("longestStreak");
    expect(habit).toHaveProperty("completedCount");
    expect(habit).toHaveProperty("createdAt");
    expect(habit).toHaveProperty("updatedAt");
  }

  /**
   * 验证习惯日志对象的基本结构
   */
  static expectHabitLogStructure(log: any) {
    expect(log).toHaveProperty("id");
    expect(log).toHaveProperty("habitId");
    expect(log).toHaveProperty("logDate");
    expect(log).toHaveProperty("completionScore");
    expect(log).toHaveProperty("createdAt");
    expect(log).toHaveProperty("updatedAt");
  }

  /**
   * 验证分页结果结构
   */
  static expectPageStructure(pageResult: any) {
    expect(pageResult).toHaveProperty("list");
    expect(pageResult).toHaveProperty("total");
    expect(pageResult).toHaveProperty("pageNum");
    expect(pageResult).toHaveProperty("pageSize");
    expect(Array.isArray(pageResult.list)).toBe(true);
    expect(typeof pageResult.total).toBe("number");
    expect(typeof pageResult.pageNum).toBe("number");
    expect(typeof pageResult.pageSize).toBe("number");
  }

  /**
   * 创建日期范围
   */
  static createDateRange(days: number, startDate?: Date) {
    const start = startDate || new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    return { start, end };
  }

  /**
   * 比较日期（忽略时间部分）
   */
  static compareDatesOnly(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * 清理所有模拟
   */
  static clearAllMocks() {
    jest.clearAllMocks();
  }

  /**
   * 重置所有模拟
   */
  static resetAllMocks() {
    jest.resetAllMocks();
  }

  /**
   * 创建测试数据库连接配置
   */
  static createTestDatabaseConfig() {
    return {
      type: "sqlite" as const,
      database: ":memory:",
      entities: [Habit, Goal, TodoRepeat],
      synchronize: true,
      logging: false,
      dropSchema: true,
    };
  }

  /**
   * 等待异步操作完成
   */
  static async waitForAsync(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 创建性能测试辅助函数
   */
  static async measurePerformance<T>(
    operation: () => Promise<T>,
    maxExecutionTime: number = 1000
  ): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now();
    const result = await operation();
    const executionTime = Date.now() - startTime;

    expect(executionTime).toBeLessThan(maxExecutionTime);

    return { result, executionTime };
  }

  /**
   * 验证状态转换的有效性
   */
  static validateStatusTransition(
    fromStatus: HabitStatus,
    toStatus: HabitStatus
  ): boolean {
    const validTransitions: Record<HabitStatus, HabitStatus[]> = {
      [HabitStatus.ACTIVE]: [
        HabitStatus.PAUSED,
        HabitStatus.COMPLETED,
        HabitStatus.ABANDONED,
      ],
      [HabitStatus.PAUSED]: [HabitStatus.ACTIVE, HabitStatus.ABANDONED],
      [HabitStatus.COMPLETED]: [HabitStatus.ACTIVE],
      [HabitStatus.ABANDONED]: [HabitStatus.ACTIVE],
    };

    return validTransitions[fromStatus]?.includes(toStatus) || false;
  }

  /**
   * 生成随机测试数据
   */
  static generateRandomTestData(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      id: `habit-${index + 1}`,
      name: `随机习惯${index + 1}`,
      importance: Math.floor(Math.random() * 5) + 1,
      currentStreak: Math.floor(Math.random() * 100),
      longestStreak: Math.floor(Math.random() * 200),
      completedCount: Math.floor(Math.random() * 1000),
    }));
  }
}
