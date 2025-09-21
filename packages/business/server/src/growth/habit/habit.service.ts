import { HabitRepository } from './habit.repository';
import { TodoRepository } from '../todo/todo.repository';
import { CreateHabitDto, UpdateHabitDto, HabitFilterDto, HabitPageFilterDto, HabitDto } from './dto';
import { Habit } from './habit.entity';
import { HabitStatus, TodoStatus } from '@life-toolkit/enum';

export class HabitService {
  habitRepository: HabitRepository;
  todoRepository: TodoRepository;

  constructor(habitRepository: HabitRepository, todoRepository: TodoRepository) {
    this.habitRepository = habitRepository;
    this.todoRepository = todoRepository;
  }

  // ====== 基础 CRUD ======
  async create(createHabitDto: CreateHabitDto): Promise<HabitDto> {
    const entity = await this.habitRepository.create(createHabitDto.exportCreateEntity());
    const habitDto = new HabitDto();
    habitDto.importEntity(entity);
    return habitDto;
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete(id);
  }

  async update(updateHabitDto: UpdateHabitDto): Promise<HabitDto> {
    const entity = await this.habitRepository.update(updateHabitDto.exportUpdateEntity());
    const habitDto = new HabitDto();
    habitDto.importEntity(entity);
    return habitDto;
  }

  async find(id: string): Promise<HabitDto> {
    const entity = await this.habitRepository.find(id);
    return HabitDto.importEntity(entity);
  }

  async findWithRelations(id: string): Promise<HabitDto> {
    const entity = await this.habitRepository.findWithRelations(id);
    const habitDto = new HabitDto();
    habitDto.importEntity(entity);
    return habitDto;
  }

  async findByFilter(filter: HabitFilterDto): Promise<HabitDto[]> {
    const entities = await this.habitRepository.findByFilter(filter);
    return entities.map((entity) => HabitDto.importEntity(entity));
  }

  async page(
    filter: HabitPageFilterDto
  ): Promise<{ list: HabitDto[]; total: number; pageNum: number; pageSize: number }> {
    const { list, total, pageNum, pageSize } = await this.habitRepository.page(filter);
    return {
      list: list.map((entity) => HabitDto.importEntity(entity)),
      total,
      pageNum,
      pageSize,
    };
  }

  //  ====== 业务逻辑编排 ======
  async abandon(id: string): Promise<void> {
    await this.update(Object.assign(new UpdateHabitDto(), { status: HabitStatus.ABANDONED }));
  }

  async restore(id: string): Promise<void> {
    await this.update(Object.assign(new UpdateHabitDto(), { status: HabitStatus.IN_PROGRESS }));
  }
}
