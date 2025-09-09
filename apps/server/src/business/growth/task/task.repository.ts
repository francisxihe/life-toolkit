import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere, Between, MoreThan, LessThan, Like, IsNull, Not } from 'typeorm';
import { TrackTime } from '../track-time';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFilterDto,
  TaskFilterDto,
  TaskDto,
  taskWithRelationsDto,
  Task,
} from '@life-toolkit/business-server';
import { TaskStatus } from '@life-toolkit/enum';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TrackTime)
    private readonly trackTimeRepository: Repository<TrackTime>
  ) {}

  // 基础 CRUD
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const entity = this.taskRepository.create({
      ...createTaskDto,
      status: TaskStatus.TODO,
      tags: createTaskDto.tags || [],
    });
    return await this.taskRepository.save(entity);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<void> {
    const exists = await this.taskRepository.findOne({ where: { id } });
    if (!exists) throw new NotFoundException(`Task not found: ${id}`);
    updateTaskDto.appendToUpdateEntity(exists);
    await this.taskRepository.save(exists);
  }

  async removeByIds(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.taskRepository.delete({ id: In(ids) });
  }

  async findWithRelations(id: string, relations?: string[]): Promise<TaskDto> {
    const entity = await this.taskRepository.findOne({
      where: { id },
      relations: relations || ['children', 'parent', 'goal', 'todoList'],
    });
    if (!entity) throw new NotFoundException('Task not found');
    return TaskDto.importEntity(entity);
  }

  async findByFilter(filter: TaskFilterDto & { excludeIds?: string[] }): Promise<TaskDto[]> {
    const where: FindOptionsWhere<Task> = this.buildWhere(filter as any);
    if (filter.excludeIds && filter.excludeIds.length) {
      where.id = Not(In(filter.excludeIds));
    }
    const entities = await this.taskRepository.find({
      where,
      relations: ['children', 'goal'],
    });
    return entities.filter((t) => !t.parent).map((t) => TaskDto.importEntity(t));
  }

  async page(
    filter: TaskPageFilterDto
  ): Promise<{ list: TaskDto[]; total: number; pageNum: number; pageSize: number }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;
    const [list, total] = await this.taskRepository.findAndCount({
      where: this.buildWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    return { list: list.map((t) => TaskDto.importEntity(t)), total, pageNum, pageSize };
  }

  async taskWithRelations(taskId: string): Promise<taskWithRelationsDto> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['children', 'parent', 'goal', 'todoList'],
    });
    if (!task) throw new NotFoundException('Task not found');

    const dto = new taskWithRelationsDto();
    dto.importEntity(task);

    if (task.trackTimeIds?.length) {
      const trackTimes = await this.trackTimeRepository.findBy({
        id: In(task.trackTimeIds),
      });
      dto.trackTimeList = trackTimes as any;
    } else {
      dto.trackTimeList = [];
    }

    return dto;
  }

  async updateStatus(id: string, status: TaskStatus, dateField: keyof Task): Promise<void> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.taskRepository.update(id, {
      status,
      [dateField]: new Date(),
    });
  }

  async doneBatch(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.taskRepository.update(
      { id: In(ids) },
      {
        status: TaskStatus.DONE,
        doneAt: new Date(),
      }
    );
  }

  // where 构建
  private buildWhere(filter: TaskPageFilterDto): FindOptionsWhere<Task> {
    const where: FindOptionsWhere<Task> = {};

    if (filter.doneDateStart && filter.doneDateEnd) {
      where.doneAt = Between(new Date(filter.doneDateStart + 'T00:00:00'), new Date(filter.doneDateEnd + 'T23:59:59'));
    } else if (filter.doneDateStart) {
      where.doneAt = MoreThan(new Date(filter.doneDateStart + 'T00:00:00'));
    } else if (filter.doneDateEnd) {
      where.doneAt = LessThan(new Date(filter.doneDateEnd + 'T23:59:59'));
    }

    if (filter.abandonedDateStart && filter.abandonedDateEnd) {
      where.abandonedAt = Between(
        new Date(filter.abandonedDateStart + 'T00:00:00'),
        new Date(filter.abandonedDateEnd + 'T23:59:59')
      );
    } else if (filter.abandonedDateStart) {
      where.abandonedAt = MoreThan(new Date(filter.abandonedDateStart + 'T00:00:00'));
    } else if (filter.abandonedDateEnd) {
      where.abandonedAt = LessThan(new Date(filter.abandonedDateEnd + 'T23:59:59'));
    }

    if (filter.startDateStart && filter.startDateEnd) {
      where.startAt = Between(new Date(filter.startDateStart), new Date(filter.startDateEnd));
    } else if (filter.startDateStart) {
      where.startAt = MoreThan(new Date(filter.startDateStart));
    } else if (filter.startDateEnd) {
      where.startAt = LessThan(new Date(filter.startDateEnd));
    }

    if (filter.endDateStart && filter.endDateEnd) {
      where.endAt = Between(new Date(filter.endDateStart), new Date(filter.endDateEnd));
    } else if (filter.endDateStart) {
      where.endAt = MoreThan(new Date(filter.endDateStart));
    } else if (filter.endDateEnd) {
      where.endAt = LessThan(new Date(filter.endDateEnd));
    }

    if (filter.keyword) where.name = Like(`%${filter.keyword}%`);
    if (filter.status) where.status = filter.status;
    if (filter.importance) where.importance = filter.importance;
    if (filter.urgency) where.urgency = filter.urgency;
    if (filter.goalIds) where.goalId = In(filter.goalIds);

    return where;
  }
}
