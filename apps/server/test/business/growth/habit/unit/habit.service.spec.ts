import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitService } from '../../../../../src/business/growth/habit/habit.service';
import { Habit, HabitFrequency, HabitDifficulty } from '../../../../../src/business/growth/habit/entities';
import { Goal } from '../../../../../src/business/growth/goal/entities';
import { TodoRepeat } from '../../../../../src/business/growth/todo/entities';
import { HabitMapper } from '../../../../../src/business/growth/habit/mapper';
import { CreateHabitDto } from '../../../../../src/business/growth/habit/dto';

describe('HabitService', () => {
  let service: HabitService;
  let habitRepository: Repository<Habit>;
  let goalRepository: Repository<Goal>;
  let todoRepeatRepository: Repository<TodoRepeat>;

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
    create: jest.fn(),
    save: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create habit with goal associations', async () => {
      const createHabitDto: CreateHabitDto = {
        name: '早起拉伸',
        description: '每天早上6点起床后进行10分钟拉伸运动',
        frequency: HabitFrequency.DAILY,
        difficulty: HabitDifficulty.MEDIUM,
        importance: 4,
        goalIds: ['goal-1', 'goal-2'],
        autoCreateTodo: true,
      };

      const mockGoals = [
        { id: 'goal-1', name: '早晨高效工作' },
        { id: 'goal-2', name: '保持健康' },
      ];

      const mockHabit = {
        id: 'habit-1',
        name: '早起拉伸',
        frequency: HabitFrequency.DAILY,
        goals: mockGoals,
      };

      const mockTodoRepeat = {
        id: 'repeat-1',
        habitId: 'habit-1',
        repeatMode: 'daily',
      };

      mockHabitMapper.toEntity.mockReturnValue(mockHabit);
      mockGoalRepository.findBy.mockResolvedValue(mockGoals);
      mockHabitRepository.create.mockReturnValue(mockHabit);
      mockHabitRepository.save.mockResolvedValue(mockHabit);
      mockTodoRepeatRepository.create.mockReturnValue(mockTodoRepeat);
      mockTodoRepeatRepository.save.mockResolvedValue(mockTodoRepeat);

      const result = await service.create(createHabitDto);

      expect(mockGoalRepository.findBy).toHaveBeenCalledWith({
        id: expect.any(Object),
      });
      expect(mockHabitRepository.save).toHaveBeenCalled();
      expect(mockTodoRepeatRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          repeatMode: 'daily',
          habitId: 'habit-1',
        })
      );
      expect(result).toEqual(mockHabit);
    });

    it('should create habit without auto todo creation', async () => {
      const createHabitDto: CreateHabitDto = {
        name: '阅读',
        autoCreateTodo: false,
      };

      const mockHabit = {
        id: 'habit-2',
        name: '阅读',
        goals: [],
      };

      mockHabitMapper.toEntity.mockReturnValue(mockHabit);
      mockHabitRepository.create.mockReturnValue(mockHabit);
      mockHabitRepository.save.mockResolvedValue(mockHabit);

      const result = await service.create(createHabitDto);

      expect(mockTodoRepeatRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockHabit);
    });
  });

  describe('findByGoalId', () => {
    it('should return habits associated with a goal', async () => {
      const goalId = 'goal-1';
      const mockHabits = [
        { id: 'habit-1', name: '早起拉伸' },
        { id: 'habit-2', name: '冥想' },
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
  });

  describe('findOneWithRelations', () => {
    it('should return habit with goals and todoRepeats', async () => {
      const habitId = 'habit-1';
      const mockHabit = {
        id: 'habit-1',
        name: '早起拉伸',
        goals: [{ id: 'goal-1', name: '早晨高效工作' }],
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
  });
}); 