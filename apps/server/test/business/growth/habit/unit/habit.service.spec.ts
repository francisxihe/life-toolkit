import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HabitService } from "../../../../../src/business/growth/habit/habit.service";
import { Habit } from "../../../../../src/business/growth/habit/entities";
import { Goal } from "../../../../../src/business/growth/goal/entities";
import {
  TodoRepeat,
  Todo,
} from "../../../../../src/business/growth/todo/entities";
import { CreateHabitDto, HabitMapper } from "@life-toolkit/business-server";
import { Difficulty } from "@life-toolkit/enum";

describe("HabitService", () => {
  let service: HabitService;
  let habitRepository: Repository<Habit>;
  let goalRepository: Repository<Goal>;
  let todoRepeatRepository: Repository<TodoRepeat>;
  let todoRepository: Repository<Todo>;

  const mockHabitRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockGoalRepository = {
    findBy: jest.fn(),
  };

  const mockTodoRepeatRepository = {
    find: jest.fn(),
  };

  const mockTodoRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockHabitMapper = {
    toEntity: jest.fn(),
    exportUpdateEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitService,
        {
          provide: getRepositoryToken(Habit),
          useValue: mockHabitRepository,
        },
        {
          provide: getRepositoryToken(Goal),
          useValue: mockGoalRepository,
        },
        {
          provide: getRepositoryToken(TodoRepeat),
          useValue: mockTodoRepeatRepository,
        },
        {
          provide: getRepositoryToken(Todo),
          useValue: mockTodoRepository,
        },
        {
          provide: HabitMapper,
          useValue: mockHabitMapper,
        },
      ],
    }).compile();

    service = module.get<HabitService>(HabitService);
    habitRepository = module.get<Repository<Habit>>(getRepositoryToken(Habit));
    goalRepository = module.get<Repository<Goal>>(getRepositoryToken(Goal));
    todoRepeatRepository = module.get<Repository<TodoRepeat>>(
      getRepositoryToken(TodoRepeat)
    );
    todoRepository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create habit with goal associations", async () => {
      const createHabitDto: CreateHabitDto = {
        name: "早起拉伸",
        description: "每天早上6点起床后进行10分钟拉伸运动",
        difficulty: Difficulty.Skilled,
        importance: 4,
        goalIds: ["goal-1", "goal-2"],
        tags: ["早晨高效工作", "保持健康"],
        startDate: new Date(),
      };

      const mockGoals = [
        { id: "goal-1", name: "早晨高效工作" },
        { id: "goal-2", name: "保持健康" },
      ];

      const mockHabit = {
        id: "habit-1",
        name: "早起拉伸",
        difficulty: Difficulty.Skilled,
        goals: mockGoals,
      };

      mockHabitMapper.toEntity.mockReturnValue(mockHabit);
      mockGoalRepository.findBy.mockResolvedValue(mockGoals);
      mockHabitRepository.create.mockReturnValue(mockHabit);
      mockHabitRepository.save.mockResolvedValue(mockHabit);

      const result = await service.create(createHabitDto);

      expect(mockGoalRepository.findBy).toHaveBeenCalledWith({
        id: expect.any(Object),
      });
      expect(mockHabitRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockHabit);
    });

    it("should create habit without goal associations", async () => {
      const createHabitDto: CreateHabitDto = {
        name: "阅读",
      };

      const mockHabit = {
        id: "habit-2",
        name: "阅读",
        goals: [],
      };

      mockHabitMapper.toEntity.mockReturnValue(mockHabit);
      mockHabitRepository.create.mockReturnValue(mockHabit);
      mockHabitRepository.save.mockResolvedValue(mockHabit);

      const result = await service.create(createHabitDto);

      expect(result).toEqual(mockHabit);
    });
  });

  describe("getHabitTodos", () => {
    it("should return habit todos grouped by status", async () => {
      const habitId = "habit-1";
      const mockHabit = { id: habitId, name: "阅读习惯" };
      const mockTodoRepeats = [
        { id: "repeat-1", habitId },
        { id: "repeat-2", habitId },
      ];
      const mockTodos = [
        { id: "todo-1", status: "todo", repeatId: "repeat-1" },
        { id: "todo-2", status: "done", originalRepeatId: "repeat-1" },
        { id: "todo-3", status: "abandoned", originalRepeatId: "repeat-2" },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTodos),
      };

      mockHabitRepository.findOne.mockResolvedValue(mockHabit);
      mockTodoRepeatRepository.find.mockResolvedValue(mockTodoRepeats);
      mockTodoRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getHabitTodos(habitId);

      expect(result).toEqual({
        activeTodos: [{ id: "todo-1", status: "todo", repeatId: "repeat-1" }],
        completedTodos: [
          { id: "todo-2", status: "done", originalRepeatId: "repeat-1" },
        ],
        abandonedTodos: [
          { id: "todo-3", status: "abandoned", originalRepeatId: "repeat-2" },
        ],
        totalCount: 3,
      });
    });

    it("should return empty result when no todo repeats exist", async () => {
      const habitId = "habit-1";
      const mockHabit = { id: habitId, name: "阅读习惯" };

      mockHabitRepository.findOne.mockResolvedValue(mockHabit);
      mockTodoRepeatRepository.find.mockResolvedValue([]);

      const result = await service.getHabitTodos(habitId);

      expect(result).toEqual({
        activeTodos: [],
        completedTodos: [],
        abandonedTodos: [],
        totalCount: 0,
      });
    });
  });

  describe("getHabitAnalytics", () => {
    it("should return habit analytics data", async () => {
      const habitId = "habit-1";
      const mockHabit = {
        id: habitId,
        name: "阅读习惯",
        currentStreak: 5,
        longestStreak: 10,
      };

      const mockTodosResult = {
        activeTodos: [
          {
            id: "todo-1",
            name: "Todo 1",
            status: "todo",
            tags: [],
            planDate: new Date(),
          } as any,
        ],
        completedTodos: [
          {
            id: "todo-2",
            name: "Todo 2",
            status: "done",
            tags: [],
            planDate: new Date(),
          } as any,
          {
            id: "todo-3",
            name: "Todo 3",
            status: "done",
            tags: [],
            planDate: new Date(),
          } as any,
        ],
        abandonedTodos: [
          {
            id: "todo-4",
            name: "Todo 4",
            status: "abandoned",
            tags: [],
            planDate: new Date(),
          } as any,
        ],
        totalCount: 4,
      };

      mockHabitRepository.findOne.mockResolvedValue(mockHabit);
      jest.spyOn(service, "getHabitTodos").mockResolvedValue(mockTodosResult);

      const result = await service.getHabitAnalytics(habitId);

      expect(result).toEqual({
        totalTodos: 4,
        completedTodos: 2,
        abandonedTodos: 1,
        completionRate: 50,
        currentStreak: 5,
        longestStreak: 10,
        recentTodos: expect.any(Array),
      });
    });
  });

  describe("findOneWithRelations", () => {
    it("should return habit with goals and todoRepeats", async () => {
      const habitId = "habit-1";
      const mockHabit = {
        id: "habit-1",
        name: "早起拉伸",
        goals: [{ id: "goal-1", name: "早晨高效工作" }],
        todoRepeats: [{ id: "repeat-1", repeatMode: "daily" }],
      };

      mockHabitRepository.findOne.mockResolvedValue(mockHabit);

      const result = await service.findOneWithRelations(habitId);

      expect(mockHabitRepository.findOne).toHaveBeenCalledWith({
        where: { id: habitId },
        relations: ["goals", "todoRepeats"],
      });
      expect(result).toEqual(mockHabit);
    });
  });
});
