import { Test, TestingModule } from "@nestjs/testing";
import { HabitController } from "../../../../../src/business/growth/habit/habit.controller";
import { HabitService } from "../../../../../src/business/growth/habit/habit.service";
import {
  HabitMapper,
  HabitPageFiltersDto,
  HabitListFiltersDto,
} from "@life-toolkit/business-server";
import { HabitStatus, Difficulty } from "@life-toolkit/enum";
import type { Habit } from "@life-toolkit/vo";
import dayjs from "dayjs";

describe("HabitController", () => {
  let controller: HabitController;
  let service: HabitService;
  let mapper: HabitMapper;

  const mockHabitService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPage: jest.fn(),
    findOne: jest.fn(),
    findOneWithRelations: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    abandon: jest.fn(),
    restore: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    batchComplete: jest.fn(),
    getHabitTodos: jest.fn(),
    getHabitAnalytics: jest.fn(),
  };

  const mockHabitMapper = {
    toVo: jest.fn(),
    voToDtoFromVo: jest.fn(),
    voToUpdateDtoFromVo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitController],
      providers: [
        {
          provide: HabitService,
          useValue: mockHabitService,
        },
        {
          provide: HabitMapper,
          useValue: mockHabitMapper,
        },
      ],
    }).compile();

    controller = module.get<HabitController>(HabitController);
    service = module.get<HabitService>(HabitService);
    mapper = module.get<HabitMapper>(HabitMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new habit", async () => {
      const createHabitVo: Habit.CreateHabitVo = {
        name: "每天阅读30分钟",
        description: "培养阅读习惯",
        importance: 4,
        tags: ["学习", "阅读"],
        difficulty: Difficulty.Skilled,
      };

      const mockDto = { ...createHabitVo };
      const mockEntity = {
        id: "habit-1",
        ...createHabitVo,
        status: HabitStatus.ACTIVE,
        currentStreak: 0,
        longestStreak: 0,
        completedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVo: Habit.HabitVo = {
        id: "habit-1",
        name: "每天阅读30分钟",
        status: HabitStatus.ACTIVE,
        description: "培养阅读习惯",
        importance: 4,
        tags: ["学习", "阅读"],
        difficulty: Difficulty.Skilled,
        startAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        currentStreak: 0,
        longestStreak: 0,
        completedCount: 0,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      mockHabitMapper.voToDtoFromVo.mockReturnValue(mockDto);
      mockHabitService.create.mockResolvedValue(mockEntity);
      mockHabitMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.create(createHabitVo);

      expect(mockHabitMapper.voToDtoFromVo).toHaveBeenCalledWith(createHabitVo);
      expect(mockHabitService.create).toHaveBeenCalledWith(mockDto);
      expect(mockHabitMapper.toVo).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual({
        code: 200,
        data: mockVo,
        message: "SUCCESS",
      });
    });
  });

  describe("update", () => {
    it("should update a habit", async () => {
      const habitId = "habit-1";
      const updateHabitVo: Habit.UpdateHabitVo = {
        name: "每天阅读45分钟",
        importance: 5,
        status: HabitStatus.ACTIVE,
      };

      const mockDto = { ...updateHabitVo };
      const mockEntity = {
        id: habitId,
        name: "每天阅读45分钟",
        importance: 5,
        status: HabitStatus.ACTIVE,
      };

      const mockVo: Habit.HabitVo = {
        id: habitId,
        name: "每天阅读45分钟",
        status: HabitStatus.ACTIVE,
        importance: 5,
        tags: [],
        difficulty: Difficulty.Skilled,
        startAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        currentStreak: 0,
        longestStreak: 0,
        completedCount: 0,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      mockHabitMapper.voToUpdateDtoFromVo.mockReturnValue(mockDto);
      mockHabitService.update.mockResolvedValue(mockEntity);
      mockHabitMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.update(habitId, updateHabitVo);

      expect(mockHabitMapper.voToUpdateDtoFromVo).toHaveBeenCalledWith(
        updateHabitVo
      );
      expect(mockHabitService.update).toHaveBeenCalledWith(habitId, mockDto);
      expect(mockHabitMapper.toVo).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual({
        code: 200,
        data: mockVo,
        message: "SUCCESS",
      });
    });
  });

  describe("findById", () => {
    it("should return a habit by id", async () => {
      const habitId = "habit-1";
      const mockEntity = {
        id: habitId,
        name: "每天阅读30分钟",
        status: HabitStatus.ACTIVE,
      };

      const mockVo: Habit.HabitVo = {
        id: habitId,
        name: "每天阅读30分钟",
        status: HabitStatus.ACTIVE,
        importance: 4,
        tags: [],
        difficulty: Difficulty.Skilled,
        startAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        currentStreak: 0,
        longestStreak: 0,
        completedCount: 0,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      mockHabitService.findOne.mockResolvedValue(mockEntity);
      mockHabitMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.findById(habitId);

      expect(mockHabitService.findOne).toHaveBeenCalledWith(habitId);
      expect(mockHabitMapper.toVo).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual({
        code: 200,
        data: mockVo,
        message: "SUCCESS",
      });
    });
  });

  describe("getHabitTodos", () => {
    it("should return habit todos", async () => {
      const habitId = "habit-1";
      const mockTodosResult = {
        activeTodos: [{ id: "todo-1", name: "Active Todo", status: "todo" }],
        completedTodos: [
          { id: "todo-2", name: "Completed Todo", status: "done" },
        ],
        abandonedTodos: [
          { id: "todo-3", name: "Abandoned Todo", status: "abandoned" },
        ],
        totalCount: 3,
      };

      mockHabitService.getHabitTodos.mockResolvedValue(mockTodosResult);

      const result = await controller.getHabitTodos(habitId);

      expect(mockHabitService.getHabitTodos).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({
        code: 200,
        data: mockTodosResult,
        message: "SUCCESS",
      });
    });
  });

  describe("getHabitAnalytics", () => {
    it("should return habit analytics", async () => {
      const habitId = "habit-1";
      const mockAnalyticsResult = {
        totalTodos: 10,
        completedTodos: 7,
        abandonedTodos: 1,
        completionRate: 70,
        currentStreak: 5,
        longestStreak: 12,
        recentTodos: [
          { id: "todo-1", name: "Recent Todo 1", status: "done" },
          { id: "todo-2", name: "Recent Todo 2", status: "todo" },
        ],
      };

      mockHabitService.getHabitAnalytics.mockResolvedValue(mockAnalyticsResult);

      const result = await controller.getHabitAnalytics(habitId);

      expect(mockHabitService.getHabitAnalytics).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({
        code: 200,
        data: mockAnalyticsResult,
        message: "SUCCESS",
      });
    });
  });

  describe("list", () => {
    it("should return a list of habits", async () => {
      const filter: HabitListFiltersDto = {
        status: HabitStatus.ACTIVE,
        difficulty: Difficulty.Skilled,
      };

      const mockHabits = [
        { id: "habit-1", name: "阅读" },
        { id: "habit-2", name: "运动" },
      ];

      const mockVos: Habit.HabitVo[] = [
        {
          id: "habit-1",
          name: "阅读",
          status: HabitStatus.ACTIVE,
          importance: 4,
          tags: [],
          difficulty: Difficulty.Skilled,
          startAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          currentStreak: 0,
          longestStreak: 0,
          completedCount: 0,
          createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          id: "habit-2",
          name: "运动",
          status: HabitStatus.ACTIVE,
          importance: 5,
          tags: [],
          difficulty: Difficulty.Skilled,
          startAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          currentStreak: 0,
          longestStreak: 0,
          completedCount: 0,
          createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
      ];

      mockHabitService.findAll.mockResolvedValue(mockHabits);
      mockHabitMapper.toVo
        .mockReturnValueOnce(mockVos[0])
        .mockReturnValueOnce(mockVos[1]);

      const result = await controller.list(filter);

      expect(mockHabitService.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        code: 200,
        data: { list: mockVos },
        message: "SUCCESS",
      });
    });
  });

  describe("page", () => {
    it("should return paginated habits", async () => {
      const filter: any = {
        pageNum: 1,
        pageSize: 10,
        status: [HabitStatus.ACTIVE],
      };

      const mockPageResult = {
        list: [{ id: "habit-1", name: "阅读" }],
        total: 1,
        pageNum: 1,
        pageSize: 10,
      };

      const mockVo: Habit.HabitVo = {
        id: "habit-1",
        name: "阅读",
        status: HabitStatus.ACTIVE,
        importance: 4,
        tags: [],
        difficulty: Difficulty.Skilled,
        startAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        currentStreak: 0,
        longestStreak: 0,
        completedCount: 0,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      mockHabitService.findPage.mockResolvedValue(mockPageResult);
      mockHabitMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.page(filter);

      expect(mockHabitService.findPage).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        code: 200,
        data: {
          list: [mockVo],
          total: 1,
          pageNum: 1,
          pageSize: 10,
        },
        message: "SUCCESS",
      });
    });
  });

  describe("delete", () => {
    it("should delete a habit", async () => {
      const habitId = "habit-1";
      const mockResult = { affected: 1 };

      mockHabitService.remove.mockResolvedValue(mockResult);

      const result = await controller.delete(habitId);

      expect(mockHabitService.remove).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({
        code: 200,
        data: mockResult,
        message: "SUCCESS",
      });
    });
  });

  describe("abandon", () => {
    it("should abandon a habit", async () => {
      const habitId = "habit-1";
      mockHabitService.abandon.mockResolvedValue(true);

      const result = await controller.abandon(habitId);

      expect(mockHabitService.abandon).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({
        code: 200,
        data: { result: true },
        message: "SUCCESS",
      });
    });
  });

  describe("restore", () => {
    it("should restore a habit", async () => {
      const habitId = "habit-1";
      mockHabitService.restore.mockResolvedValue(true);

      const result = await controller.restore(habitId);

      expect(mockHabitService.restore).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({
        code: 200,
        data: { result: true },
        message: "SUCCESS",
      });
    });
  });

  describe("pause", () => {
    it("should pause a habit", async () => {
      const habitId = "habit-1";
      mockHabitService.pause.mockResolvedValue(true);

      const result = await controller.pause(habitId);

      expect(mockHabitService.pause).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({
        code: 200,
        data: { result: true },
        message: "SUCCESS",
      });
    });
  });

  describe("resume", () => {
    it("should resume a habit", async () => {
      const habitId = "habit-1";
      mockHabitService.resume.mockResolvedValue(true);

      const result = await controller.resume(habitId);

      expect(mockHabitService.resume).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({
        code: 200,
        data: { result: true },
        message: "SUCCESS",
      });
    });
  });

  describe("batchComplete", () => {
    it("should batch complete habits", async () => {
      const habitIds = ["habit-1", "habit-2"];
      const mockResult = { affected: 2 };

      mockHabitService.batchComplete.mockResolvedValue(mockResult);

      const result = await controller.batchComplete({ idList: habitIds });

      expect(mockHabitService.batchComplete).toHaveBeenCalledWith(habitIds);
      expect(result).toEqual({
        code: 200,
        data: mockResult,
        message: "SUCCESS",
      });
    });
  });
});
