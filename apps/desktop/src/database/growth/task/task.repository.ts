import { In, Repository, DeepPartial } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFiltersDto,
  TaskListFiltersDto,
  TaskDto,
  TaskWithTrackTimeDto,
  Task,
  TaskMapper,
} from "@life-toolkit/business-server";

export class TaskRepository /* implements import("@life-toolkit/business-server").TaskRepository */ {
  private repo: Repository<Task>;

  constructor() {
    this.repo = AppDataSource.getRepository(Task);
  }

  private buildQuery(
    filter: TaskListFiltersDto & {
      excludeIds?: string[];
    }
  ) {
    let qb = this.repo
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.parent", "parent")
      .leftJoinAndSelect("task.children", "children")
      .andWhere("task.deletedAt IS NULL");

    const { excludeIds } = filter;
    if (excludeIds && excludeIds.length)
      qb = qb.andWhere("task.id NOT IN (:...excludeIds)", { excludeIds });

    const { keyword } = filter;
    if (keyword)
      qb = qb.andWhere("(task.name LIKE :kw OR task.description LIKE :kw)", {
        kw: `%${keyword}%`,
      });

    const { status } = filter;
    if (status)
      qb = qb.andWhere("task.status = :status", {
        status,
      });

    const { startDateStart, startDateEnd } = filter;
    if (startDateStart)
      qb = qb.andWhere("task.startAt >= :startDateStart", {
        startDateStart: new Date(`${startDateStart}T00:00:00`),
      });
    if (startDateEnd)
      qb = qb.andWhere("task.startAt <= :startDateEnd", {
        startDateEnd: new Date(`${startDateEnd}T23:59:59`),
      });

    const { endDateStart, endDateEnd } = filter;
    if (endDateStart)
      qb = qb.andWhere("task.endAt >= :endDateStart", {
        endDateStart: new Date(`${endDateStart}T00:00:00`),
      });
    if (endDateEnd)
      qb = qb.andWhere("task.endAt <= :endDateEnd", {
        endDateEnd: new Date(`${endDateEnd}T23:59:59`),
      });

    // 完成时间范围：doneDateStart/doneDateEnd -> completedAt
    const { doneDateStart, doneDateEnd } = filter;
    if (doneDateStart && doneDateEnd) {
      qb = qb.andWhere("task.completedAt BETWEEN :ds AND :de", {
        ds: new Date(`${doneDateStart}T00:00:00`),
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    } else if (doneDateStart) {
      qb = qb.andWhere("task.completedAt >= :ds", {
        ds: new Date(`${doneDateStart}T00:00:00`),
      });
    } else if (doneDateEnd) {
      qb = qb.andWhere("task.completedAt <= :de", {
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    }

    // goalIds 过滤
    const { goalIds } = filter;
    if (goalIds && goalIds.length)
      qb = qb.andWhere("task.goalId IN (:...goalIds)", { goalIds });

    return qb.orderBy("task.updatedAt", "DESC");
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const entity = this.repo.create({
      name: createTaskDto.name,
      description: createTaskDto.description,
      tags: createTaskDto.tags,
      goalId: createTaskDto.goalId,
      endAt: createTaskDto.endAt,
    });
    const saved = await this.repo.save(entity);
    return saved;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`任务不存在，ID: ${id}`);
    updateTaskDto.applyToUpdateEntity(entity);
    await this.repo.save(entity);
  }

  async removeByIds(ids: string[]): Promise<void> {
    if (!ids || !ids.length) return;
    await this.repo.softDelete({ id: In(ids) });
  }

  async findById(id: string, relations?: string[]): Promise<TaskDto> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: relations ?? ["parent", "children", "goal", "todoList"],
    });
    if (!entity) throw new Error(`任务不存在，ID: ${id}`);
    return TaskMapper.entityToDto(entity);
  }

  async findAll(filter: TaskListFiltersDto): Promise<TaskDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    return list.map((e) => TaskMapper.entityToDto(e));
  }

  async page(
    filter: TaskPageFiltersDto
  ): Promise<{ list: TaskDto[]; total: number }> {
    const pageNum = filter.pageNum ?? 1;
    const pageSize = filter.pageSize ?? 10;
    const qb = this.buildQuery(filter);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: entities.map((e) => TaskMapper.entityToDto(e)), total };
  }

  async taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto> {
    const base = await this.findById(taskId);
    const result: TaskWithTrackTimeDto = { ...base, trackTimeList: [] };
    return result;
  }

  async findByGoalIds(goalIds: string[]): Promise<Task[]> {
    if (!goalIds || goalIds.length === 0) return [];
    const list = await this.repo.find({ where: { goalId: In(goalIds) } });
    return list;
  }
}
