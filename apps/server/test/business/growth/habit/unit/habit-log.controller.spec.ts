import { Test, TestingModule } from '@nestjs/testing';
import { HabitLogController } from '../../../../../src/business/growth/habit/habit-log.controller';
import { HabitLogService } from '../../../../../src/business/growth/habit/habit-log.service';
import { HabitLogMapper } from '../../../../../src/business/growth/habit/mapper';
import type { Habit } from '@life-toolkit/vo';
import { NotFoundException } from '@nestjs/common';

describe('HabitLogController', () => {
  let controller: HabitLogController;
  let service: HabitLogService;
  let mapper: HabitLogMapper;

  const mockHabitLogService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDate: jest.fn(),
    findByDateRange: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockHabitLogMapper = {
    toVo: jest.fn(),
    voToDtoFromVo: jest.fn(),
    voToUpdateDtoFromVo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitLogController],
      providers: [
        {
          provide: HabitLogService,
          useValue: mockHabitLogService,
        },
        {
          provide: HabitLogMapper,
          useValue: mockHabitLogMapper,
        },
      ],
    }).compile();

    controller = module.get<HabitLogController>(HabitLogController);
    service = module.get<HabitLogService>(HabitLogService);
    mapper = module.get<HabitLogMapper>(HabitLogMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new habit log', async () => {
      const createHabitLogVo: Habit.CreateHabitLogVo = {
        habitId: 'habit-1',
        logDate: new Date('2024-01-01'),
        completionScore: 2,
        note: '今天完成得很好',
        mood: 4,
      };

      const mockDto = { ...createHabitLogVo };
      const mockEntity = {
        id: 'log-1',
        ...createHabitLogVo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVo: Habit.HabitLogVo = {
        id: 'log-1',
        habitId: 'habit-1',
        logDate: new Date('2024-01-01'),
        completionScore: 2,
        note: '今天完成得很好',
        mood: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockHabitLogMapper.voToDtoFromVo.mockReturnValue(mockDto);
      mockHabitLogService.create.mockResolvedValue(mockEntity);
      mockHabitLogMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.create(createHabitLogVo);

      expect(mockHabitLogMapper.voToDtoFromVo).toHaveBeenCalledWith(createHabitLogVo);
      expect(mockHabitLogService.create).toHaveBeenCalledWith(mockDto);
      expect(mockHabitLogMapper.toVo).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockVo);
    });
  });

  describe('update', () => {
    it('should update a habit log', async () => {
      const logId = 'log-1';
      const updateHabitLogVo: Habit.UpdateHabitLogVo = {
        completionScore: 1,
        note: '今天只完成了一半',
        mood: 3,
      };

      const mockDto = { ...updateHabitLogVo };
      const mockEntity = {
        id: logId,
        habitId: 'habit-1',
        logDate: new Date('2024-01-01'),
        ...updateHabitLogVo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVo: Habit.HabitLogVo = {
        id: logId,
        habitId: 'habit-1',
        logDate: new Date('2024-01-01'),
        completionScore: 1,
        note: '今天只完成了一半',
        mood: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockHabitLogMapper.voToUpdateDtoFromVo.mockReturnValue(mockDto);
      mockHabitLogService.update.mockResolvedValue(mockEntity);
      mockHabitLogMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.update(logId, updateHabitLogVo);

      expect(mockHabitLogMapper.voToUpdateDtoFromVo).toHaveBeenCalledWith(updateHabitLogVo);
      expect(mockHabitLogService.update).toHaveBeenCalledWith(logId, mockDto);
      expect(mockHabitLogMapper.toVo).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockVo);
    });
  });

  describe('findById', () => {
    it('should return a habit log by id', async () => {
      const logId = 'log-1';
      const mockEntity = {
        id: logId,
        habitId: 'habit-1',
        logDate: new Date('2024-01-01'),
        completionScore: 2,
        note: '完成得很好',
        mood: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVo: Habit.HabitLogVo = {
        id: logId,
        habitId: 'habit-1',
        logDate: new Date('2024-01-01'),
        completionScore: 2,
        note: '完成得很好',
        mood: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockHabitLogService.findOne.mockResolvedValue(mockEntity);
      mockHabitLogMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.findById(logId);

      expect(mockHabitLogService.findOne).toHaveBeenCalledWith(logId);
      expect(mockHabitLogMapper.toVo).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockVo);
    });
  });

  describe('list', () => {
    it('should return a list of habit logs for a habit', async () => {
      const habitId = 'habit-1';
      const mockEntities = [
        {
          id: 'log-1',
          habitId,
          logDate: new Date('2024-01-01'),
          completionScore: 2,
          note: '第一天',
          mood: 4,
        },
        {
          id: 'log-2',
          habitId,
          logDate: new Date('2024-01-02'),
          completionScore: 1,
          note: '第二天',
          mood: 3,
        },
      ];

      const mockVos: Habit.HabitLogVo[] = mockEntities.map(entity => ({
        id: entity.id,
        habitId: entity.habitId,
        logDate: entity.logDate,
        completionScore: entity.completionScore,
        note: entity.note,
        mood: entity.mood,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockHabitLogService.findAll.mockResolvedValue(mockEntities);
      mockHabitLogMapper.toVo.mockImplementation((entity) => 
        mockVos.find(vo => vo.id === entity.id)
      );

      const result = await controller.list(habitId);

      expect(mockHabitLogService.findAll).toHaveBeenCalledWith(habitId);
      expect(result).toEqual({ list: mockVos });
    });
  });

  describe('findByDate', () => {
    it('should return a habit log by date', async () => {
      const habitId = 'habit-1';
      const date = new Date('2024-01-01');
      const mockEntity = {
        id: 'log-1',
        habitId,
        logDate: date,
        completionScore: 2,
        note: '今天完成得很好',
        mood: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVo: Habit.HabitLogVo = {
        id: 'log-1',
        habitId,
        logDate: date,
        completionScore: 2,
        note: '今天完成得很好',
        mood: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockHabitLogService.findByDate.mockResolvedValue(mockEntity);
      mockHabitLogMapper.toVo.mockReturnValue(mockVo);

      const result = await controller.findByDate(habitId, date);

      expect(mockHabitLogService.findByDate).toHaveBeenCalledWith(habitId, date);
      expect(mockHabitLogMapper.toVo).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockVo);
    });

    it('should return null when no log found for date', async () => {
      const habitId = 'habit-1';
      const date = new Date('2024-01-01');
      const notFoundError = new NotFoundException('Log not found');
      notFoundError.name = 'NotFoundException';

      mockHabitLogService.findByDate.mockRejectedValue(notFoundError);

      const result = await controller.findByDate(habitId, date);

      expect(mockHabitLogService.findByDate).toHaveBeenCalledWith(habitId, date);
      expect(result).toBeNull();
    });

    it('should throw error for other exceptions', async () => {
      const habitId = 'habit-1';
      const date = new Date('2024-01-01');
      const error = new Error('Database error');

      mockHabitLogService.findByDate.mockRejectedValue(error);

      await expect(controller.findByDate(habitId, date)).rejects.toThrow('Database error');
    });
  });

  describe('findByDateRange', () => {
    it('should return habit logs within date range', async () => {
      const habitId = 'habit-1';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');
      
      const mockEntities = [
        {
          id: 'log-1',
          habitId,
          logDate: new Date('2024-01-01'),
          completionScore: 2,
          note: '第一天',
          mood: 4,
        },
        {
          id: 'log-2',
          habitId,
          logDate: new Date('2024-01-02'),
          completionScore: 1,
          note: '第二天',
          mood: 3,
        },
        {
          id: 'log-3',
          habitId,
          logDate: new Date('2024-01-03'),
          completionScore: 2,
          note: '第三天',
          mood: 5,
        },
      ];

      const mockVos: Habit.HabitLogVo[] = mockEntities.map(entity => ({
        id: entity.id,
        habitId: entity.habitId,
        logDate: entity.logDate,
        completionScore: entity.completionScore,
        note: entity.note,
        mood: entity.mood,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockHabitLogService.findByDateRange.mockResolvedValue(mockEntities);
      mockHabitLogMapper.toVo.mockImplementation((entity) => 
        mockVos.find(vo => vo.id === entity.id)
      );

      const result = await controller.findByDateRange(habitId, startDate, endDate);

      expect(mockHabitLogService.findByDateRange).toHaveBeenCalledWith(habitId, startDate, endDate);
      expect(result).toEqual({ list: mockVos });
    });
  });

  describe('delete', () => {
    it('should delete a habit log', async () => {
      const logId = 'log-1';
      const mockResult = { affected: 1 };

      mockHabitLogService.remove.mockResolvedValue(mockResult);

      const result = await controller.delete(logId);

      expect(mockHabitLogService.remove).toHaveBeenCalledWith(logId);
      expect(result).toEqual(mockResult);
    });
  });
}); 