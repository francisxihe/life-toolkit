import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { HabitService } from '../../../../../src/business/growth/habit/habit.service';
import { Habit, HabitStatus, HabitFrequency, HabitDifficulty } from '../../../../../src/business/growth/habit/entities';
import { Goal } from '../../../../../src/business/growth/goal/entities';
import { TodoRepeat } from '../../../../../src/business/growth/todo/entities';
import { HabitMapper } from '../../../../../src/business/growth/habit/mapper';
import { CreateHabitDto, UpdateHabitDto, HabitPageFilterDto } from '../../../../../src/business/growth/habit/dto';

describe('HabitService (Enhanced)', () => {
  let service: HabitService;
  let habitRepository: Repository<Habit>;
  let goalRepository: Repository<Goal>;
  let todoRepeatRepository: Repository<TodoRepeat>;
  let habitMapper: HabitMapper;

  const mockHabitRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  const mockGoalRepository = {
    findBy: jest.fn(),
    findByIds: jest.fn(),
  };

  const mockTodoRepeatRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockHabitMapper = {
    toEntity: jest.fn(),
    toUpdateEntity: jest.fn(),
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
          provide: HabitMapper,
          useValue: mockHabitMapper,
        },
      ],
    }).compile();

    service = module.get<HabitService>(HabitService);
    habitRepository = module.get<Repository<Habit>>(getRepositoryToken(Habit));
    goalRepository = module.get<Repository<Goal>>(getRepositoryToken(Goal));
    todoRepeatRepository = module.get<Repository<TodoRepeat>>(getRepositoryToken(TodoRepeat));
    habitMapper = module.get<HabitMapper>(HabitMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createHabitDto: CreateHabitDto = {
      name: '每天阅读30分钟',
      description: '培养阅读习惯',
      frequency: HabitFrequency.DAILY,
      difficulty: HabitDifficulty.MEDIUM,
      importance: 4,
      goalIds: ['goal-1', 'goal-2'],
      autoCreateTodo: true,
    };

    it('should create habit successfully with goals and todo', async () => {
      const mockGoals = [
        { id: 'goal-1', title: '学习目标' },
        { id: 'goal-2', title: '个人成长' },
      ];

      const mockHabitEntity = {
        name: '每天阅读30分钟',
        description: '培养阅读习惯',
        frequency: HabitFrequency.DAILY,
        difficulty: HabitDifficulty.MEDIUM,
        importance: 4,
        autoCreateTodo: true,
      };

      const mockSavedHabit = {
        id: 'habit-1',
        ...mockHabitEntity,
        goals: mockGoals,
        status: HabitStatus.ACTIVE,
        currentStreak: 0,
        longestStreak: 0,
        completedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTodoRepeat = {
        id: 'repeat-1',
        habitId: 'habit-1',
        repeatMode: 'daily',
      };

      mockHabitMapper.toEntity.mockReturnValue(mockHabitEntity);
      mockGoalRepository.findBy.mockResolvedValue(mockGoals);
      mockHabitRepository.create.mockReturnValue(mockHabitEntity);
      mockHabitRepository.save.mockResolvedValue(mockSavedHabit);
      mockTodoRepeatRepository.create.mockReturnValue(mockTodoRepeat);
      mockTodoRepeatRepository.save.mockResolvedValue(mockTodoRepeat);

      const result = await service.create(createHabitDto);

      expect(mockHabitMapper.toEntity).toHaveBeenCalledWith(createHabitDto);
      expect(mockGoalRepository.findBy).toHaveBeenCalledWith({
        id: expect.any(Object),
      });
      expect(mockHabitRepository.save).toHaveBeenCalled();
      expect(mockTodoRepeatRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockSavedHabit);
    });

    it('should create habit without goals when goalIds is empty', async () => {
      const dtoWithoutGoals = { ...createHabitDto, goalIds: [] };
      const mockHabitEntity = { ...createHabitDto };
      const mockSavedHabit = { id: 'habit-1', ...mockHabitEntity };

      mockHabitMapper.toEntity.mockReturnValue(mockHabitEntity);
      mockHabitRepository.create.mockReturnValue(mockHabitEntity);
      mockHabitRepository.save.mockResolvedValue(mockSavedHabit);

      const result = await service.create(dtoWithoutGoals);

      expect(mockGoalRepository.findBy).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedHabit);
    });

    it('should create habit without todo when autoCreateTodo is false', async () => {
      const dtoWithoutTodo = { ...createHabitDto, autoCreateTodo: false };
      const mockHabitEntity = { ...dtoWithoutTodo };
      const mockSavedHabit = { id: 'habit-1', ...mockHabitEntity };

      mockHabitMapper.toEntity.mockReturnValue(mockHabitEntity);
      mockHabitRepository.create.mockReturnValue(mockHabitEntity);
      mockHabitRepository.save.mockResolvedValue(mockSavedHabit);

      const result = await service.create(dtoWithoutTodo);

      expect(mockTodoRepeatRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedHabit);
    });

    it('should throw error when goal not found', async () => {
      mockHabitMapper.toEntity.mockReturnValue({});
      mockGoalRepository.findBy.mockResolvedValue([]);

      await expect(service.create(createHabitDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle database save error', async () => {
      mockHabitMapper.toEntity.mockReturnValue({});
      mockGoalRepository.findBy.mockResolvedValue([]);
      mockHabitRepository.create.mockReturnValue({});
      mockHabitRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create({ ...createHabitDto, goalIds: [] })).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return habit when found', async () => {
      const habitId = 'habit-1';
      const mockHabit = {
        id: habitId,
        name: '每天阅读30分钟',
        status: HabitStatus.ACTIVE,
      };

      mockHabitRepository.findOne.mockResolvedValue(mockHabit);

      const result = await service.findOne(habitId);

      expect(mockHabitRepository.findOne).toHaveBeenCalledWith({
        where: { id: habitId },
      });
      expect(result).toEqual(mockHabit);
    });

    it('should throw NotFoundException when habit not found', async () => {
      const habitId = 'non-existent';
      mockHabitRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(habitId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const habitId = 'habit-1';
    const updateHabitDto: UpdateHabitDto = {
      name: '每天阅读45分钟',
      importance: 5,
      status: HabitStatus.ACTIVE,
    };

    it('should update habit successfully', async () => {
      const existingHabit = {
        id: habitId,
        name: '每天阅读30分钟',
        importance: 4,
        status: HabitStatus.ACTIVE,
      };

      const updateEntity = { ...updateHabitDto };
      const updatedHabit = { ...existingHabit, ...updateHabitDto };

      mockHabitRepository.findOne.mockResolvedValue(existingHabit);
      mockHabitMapper.toUpdateEntity.mockReturnValue(updateEntity);
      mockHabitRepository.save.mockResolvedValue(updatedHabit);

      const result = await service.update(habitId, updateHabitDto);

      expect(mockHabitRepository.findOne).toHaveBeenCalledWith({
        where: { id: habitId },
      });
      expect(mockHabitMapper.toUpdateEntity).toHaveBeenCalledWith(updateHabitDto);
      expect(mockHabitRepository.save).toHaveBeenCalledWith({
        ...existingHabit,
        ...updateEntity,
      });
      expect(result).toEqual(updatedHabit);
    });

    it('should throw NotFoundException when habit not found', async () => {
      mockHabitRepository.findOne.mockResolvedValue(null);

      await expect(service.update(habitId, updateHabitDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete habit successfully', async () => {
      const habitId = 'habit-1';
      const mockResult = { affected: 1 };

      mockHabitRepository.delete.mockResolvedValue(mockResult);

      const result = await service.remove(habitId);

      expect(mockHabitRepository.delete).toHaveBeenCalledWith(habitId);
      expect(result).toEqual(mockResult);
    });

    it('should handle deletion of non-existent habit', async () => {
      const habitId = 'non-existent';
      const mockResult = { affected: 0 };

      mockHabitRepository.delete.mockResolvedValue(mockResult);

      const result = await service.remove(habitId);

      expect(result).toEqual(mockResult);
    });
  });

  describe('findPage', () => {
    it('should return paginated results', async () => {
      const filter: HabitPageFilterDto = {
        keyword: '阅读',
        status: [HabitStatus.ACTIVE],
        pageNum: 1,
        pageSize: 10,
      };

      const mockHabits = [
        { id: 'habit-1', name: '每天阅读30分钟' },
        { id: 'habit-2', name: '阅读技术书籍' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockHabits, 2]),
      };

      mockHabitRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findPage(filter);

      expect(mockHabitRepository.createQueryBuilder).toHaveBeenCalledWith('habit');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        list: mockHabits,
        total: 2,
        pageNum: 1,
        pageSize: 10,
      });
    });

    it('should handle empty results', async () => {
      const filter: HabitPageFilterDto = {
        pageNum: 1,
        pageSize: 10,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockHabitRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findPage(filter);

      expect(result).toEqual({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
      });
    });
  });

  describe('status operations', () => {
    const habitId = 'habit-1';

    describe('abandon', () => {
      it('should abandon habit successfully', async () => {
        const mockResult = { affected: 1 };
        mockHabitRepository.update.mockResolvedValue(mockResult);

        const result = await service.abandon(habitId);

        expect(mockHabitRepository.update).toHaveBeenCalledWith(
          habitId,
          { status: HabitStatus.ABANDONED }
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('restore', () => {
      it('should restore habit successfully', async () => {
        const mockResult = { affected: 1 };
        mockHabitRepository.update.mockResolvedValue(mockResult);

        const result = await service.restore(habitId);

        expect(mockHabitRepository.update).toHaveBeenCalledWith(
          habitId,
          { status: HabitStatus.ACTIVE }
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('pause', () => {
      it('should pause habit successfully', async () => {
        const mockResult = { affected: 1 };
        mockHabitRepository.update.mockResolvedValue(mockResult);

        const result = await service.pause(habitId);

        expect(mockHabitRepository.update).toHaveBeenCalledWith(
          habitId,
          { status: HabitStatus.PAUSED }
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('resume', () => {
      it('should resume habit successfully', async () => {
        const mockResult = { affected: 1 };
        mockHabitRepository.update.mockResolvedValue(mockResult);

        const result = await service.resume(habitId);

        expect(mockHabitRepository.update).toHaveBeenCalledWith(
          habitId,
          { status: HabitStatus.ACTIVE }
        );
        expect(result).toEqual(mockResult);
      });
    });
  });

  describe('batchComplete', () => {
    it('should complete multiple habits', async () => {
      const habitIds = ['habit-1', 'habit-2', 'habit-3'];
      const mockResult = { affected: 3 };

      mockHabitRepository.update.mockResolvedValue(mockResult);

      const result = await service.batchComplete(habitIds);

      expect(mockHabitRepository.update).toHaveBeenCalledWith(
        habitIds,
        { status: HabitStatus.COMPLETED }
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle empty habit list', async () => {
      const habitIds: string[] = [];
      const mockResult = { affected: 0 };

      mockHabitRepository.update.mockResolvedValue(mockResult);

      const result = await service.batchComplete(habitIds);

      expect(result).toEqual(mockResult);
    });
  });

  describe('findByGoalId', () => {
    it('should return habits associated with goal', async () => {
      const goalId = 'goal-1';
      const mockHabits = [
        { id: 'habit-1', name: '每天阅读30分钟' },
        { id: 'habit-2', name: '早起锻炼' },
      ];

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockHabits),
      };

      mockHabitRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByGoalId(goalId);

      expect(mockHabitRepository.createQueryBuilder).toHaveBeenCalledWith('habit');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('habit.goals', 'goal');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('goal.id = :goalId', { goalId });
      expect(result).toEqual(mockHabits);
    });

    it('should return empty array when no habits found', async () => {
      const goalId = 'goal-1';

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockHabitRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByGoalId(goalId);

      expect(result).toEqual([]);
    });
  });

  describe('findOneWithRelations', () => {
    it('should return habit with relations', async () => {
      const habitId = 'habit-1';
      const mockHabit = {
        id: habitId,
        name: '每天阅读30分钟',
        goals: [{ id: 'goal-1', title: '学习目标' }],
        todoRepeats: [{ id: 'repeat-1', repeatMode: 'daily' }],
      };

      mockHabitRepository.findOne.mockResolvedValue(mockHabit);

      const result = await service.findOneWithRelations(habitId);

      expect(mockHabitRepository.findOne).toHaveBeenCalledWith({
        where: { id: habitId },
        relations: ['goals', 'todoRepeats'],
      });
      expect(result).toEqual(mockHabit);
    });

    it('should throw NotFoundException when habit not found', async () => {
      const habitId = 'non-existent';
      mockHabitRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneWithRelations(habitId)).rejects.toThrow(NotFoundException);
    });
  });
}); 