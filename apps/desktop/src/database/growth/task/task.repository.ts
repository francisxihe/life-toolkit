import { In, Repository, DeepPartial } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFilterDto,
  TaskListFilterDto,
  TaskDto,
  TaskWithTrackTimeDto,
  Task,
} from "@life-toolkit/business-server";
import { TaskStatus } from "@life-toolkit/enum";

export class TaskRepository /* implements import("@life-toolkit/business-server").TaskRepository */ {
  private repo: Repository<Task>;

  constructor() {
    this.repo = AppDataSource.getRepository(Task);
  }

  private toDto(entity: Task): TaskDto {
    const dto: any = {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      name: entity.name,
      description: entity.description,
      status: entity.status as unknown as TaskStatus,
      // desktop 不含 importance/urgency/estimateTime/startAt/abandonedAt
      importance: undefined,
      urgency: undefined,
      estimateTime: undefined,
      startAt: undefined,
      endAt: entity.dueDate,
      doneAt: entity.completedAt,
      abandonedAt: undefined,
      tags: entity.tags,
      parent: (entity as any).parent,
      children: (entity as any).children,
      goal: (entity as any).goal,
      goalId: entity.goalId,
      todoList: (entity as any).todoList,
    };
    return dto as TaskDto;
  }

  private buildQuery(filter: TaskListFilterDto & { excludeIds?: string[] }) {
    let qb = this.repo
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.parent", "parent")
      .leftJoinAndSelect("task.children", "children")
      .andWhere("task.deletedAt IS NULL");

    const excludeIds = (filter as any).excludeIds as string[] | undefined;
    if (excludeIds && excludeIds.length)
      qb = qb.andWhere("task.id NOT IN (:...excludeIds)", { excludeIds });

    const keyword = (filter as any).keyword as string | undefined;
    if (keyword)
      qb = qb.andWhere("(task.name LIKE :kw OR task.description LIKE :kw)", {
        kw: `%${keyword}%`,
      });

    if (filter.status)
      qb = qb.andWhere("task.status = :status", {
        status: filter.status as any,
      });

    // importance/urgency desktop 不存在，忽略

    // 时间范围映射：startAt/endAt -> dueDate（仅 endAt 有对应）
    const startAt = (filter as any).startAt as string | undefined;
    const endAt = (filter as any).endAt as string | undefined;
    if (startAt)
      qb = qb.andWhere("task.dueDate >= :startAt", {
        startAt: new Date(`${startAt}T00:00:00`),
      });
    if (endAt)
      qb = qb.andWhere("task.dueDate <= :endAt", {
        endAt: new Date(`${endAt}T23:59:59`),
      });

    // 完成时间范围：doneDateStart/doneDateEnd -> completedAt
    const doneDateStart = (filter as any).doneDateStart as string | undefined;
    const doneDateEnd = (filter as any).doneDateEnd as string | undefined;
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
    const goalIds = (filter as any).goalIds as string[] | undefined;
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
      // endAt 对应 desktop 的 dueDate
      dueDate: (createTaskDto as any).endAt,
      // status 走默认值
    } as DeepPartial<Task>);
    const saved = await this.repo.save(entity);
    return saved as unknown as Task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`任务不存在，ID: ${id}`);
    if (updateTaskDto.name !== undefined) entity.name = updateTaskDto.name;
    if (updateTaskDto.description !== undefined)
      entity.description = updateTaskDto.description;
    if (updateTaskDto.tags !== undefined)
      entity.tags = updateTaskDto.tags as any;
    if ((updateTaskDto as any).endAt !== undefined)
      entity.dueDate = (updateTaskDto as any).endAt as any;
    if (updateTaskDto.goalId !== undefined)
      entity.goalId = updateTaskDto.goalId as any;
    // 其它字段（importance/urgency/estimateTime/startAt/abandonedAt/doneAt）desktop 不存储，忽略
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
    return this.toDto(entity);
  }

  async findAll(
    filter: TaskListFilterDto & { excludeIds?: string[] }
  ): Promise<TaskDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    return list.map((e) => this.toDto(e));
  }

  async page(
    filter: TaskPageFilterDto
  ): Promise<{ list: TaskDto[]; total: number }> {
    const { pageNum = 1, pageSize = 10 } = (filter as any) || {};
    const qb = this.buildQuery(filter as any);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: entities.map((e) => this.toDto(e)), total };
  }

  async taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto> {
    const base = await this.findById(taskId);
    return { ...(base as any), trackTimeList: [] } as TaskWithTrackTimeDto;
  }

  async findByGoalIds(goalIds: string[]): Promise<Task[]> {
    if (!goalIds || goalIds.length === 0) return [] as any;
    const list = await this.repo.find({ where: { goalId: In(goalIds) } });
    return list as unknown as Task[];
  }
}
