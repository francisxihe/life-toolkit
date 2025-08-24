import { TreeRepository } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  TaskService as BusinessTaskService,
  CreateTaskDto,
  UpdateTaskDto,
  TaskListFilterDto,
  TaskPageFilterDto,
  TaskDto,
  TaskWithTrackTimeDto,
  Task,
} from "@life-toolkit/business-server";
import { TaskRepository as DesktopTaskRepository } from "./task.repository";
import { TaskTreeRepository as DesktopTaskTreeRepository } from "./task-tree.repository";
import { DesktopTodoCleanupService } from "./todo-cleanup.service";
import { TaskStatus } from "@life-toolkit/enum";

export class TaskService {
  private service: BusinessTaskService;
  private treeRepo: TreeRepository<Task>;

  constructor() {
    const repo = new DesktopTaskRepository();
    const treeRepoAdapter = new DesktopTaskTreeRepository();
    const todoCleanup = new DesktopTodoCleanupService();
    this.service = new BusinessTaskService(
      repo as any,
      treeRepoAdapter as any,
      todoCleanup as any
    );
    this.treeRepo = AppDataSource.getTreeRepository(Task);
  }

  async create(taskData: {
    name: string;
    status?: TaskStatus;
    description?: string;
    startAt?: Date;
    endAt?: Date;
    estimateTime?: string;
    importance?: number;
    urgency?: number;
    tags?: string[];
    goalId?: string;
    parentId?: string;
  }): Promise<TaskDto> {
    const dto: CreateTaskDto = {
      name: taskData.name,
      description: taskData.description,
      tags: taskData.tags,
      goalId: taskData.goalId,
      startAt: taskData.startAt,
      endAt: taskData.endAt,
      estimateTime: taskData.estimateTime,
      importance: taskData.importance,
      urgency: taskData.urgency,
      // status 由仓储默认或更新逻辑处理
      parentId: taskData.parentId,
    } as any;
    return await this.service.create(dto);
  }

  async findById(id: string): Promise<TaskDto> {
    return await this.service.findById(id);
  }

  async findAll(): Promise<TaskDto[]> {
    return await this.service.findAll({} as TaskListFilterDto);
  }

  async findTree(): Promise<Task[]> {
    // 直接使用 TypeORM 树查询，保持 IPC 兼容（结构为实体树）
    return await this.treeRepo.findTrees();
  }

  async update(
    id: string,
    data: Partial<Task> & { parentId?: string }
  ): Promise<TaskDto> {
    const dto: UpdateTaskDto = {
      name: (data as any).name,
      description: (data as any).description,
      tags: (data as any).tags,
      goalId: (data as any).goalId,
      // 映射 desktop 的 dueDate -> 业务 endAt
      endAt: (data as any).dueDate ?? (data as any).endAt,
      // 状态与完成/放弃时间
      status: (data as any).status as any,
      doneAt: (data as any).completedAt,
      abandonedAt: (data as any).abandonedAt,
      parentId: (data as any).parentId,
    } as any;

    // 若仅变更状态，自动处理时间戳
    if ((data as any)?.status === TaskStatus.DONE && !dto.doneAt)
      dto.doneAt = new Date();
    if ((data as any)?.status === TaskStatus.ABANDONED && !dto.abandonedAt)
      dto.abandonedAt = new Date();
    if ((data as any)?.status === TaskStatus.TODO) {
      // 还原状态时不强制清空时间，交由业务/仓储按需处理
    }

    return await this.service.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async findByGoalId(goalId: string): Promise<TaskDto[]> {
    return await this.service.findAll({ goalIds: [goalId] } as any);
  }

  async findByStatus(status: TaskStatus): Promise<TaskDto[]> {
    return await this.service.findAll({ status } as any);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    const dto: UpdateTaskDto = { status: status as any } as any;
    if (status === TaskStatus.DONE) (dto as any).doneAt = new Date();
    if (status === TaskStatus.ABANDONED) (dto as any).abandonedAt = new Date();
    await this.service.update(id, dto);
  }

  async page(
    pageNum: number,
    pageSize: number
  ): Promise<{
    data: TaskDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const res = await this.service.page({
      pageNum,
      pageSize,
    } as unknown as TaskPageFilterDto);
    return { data: res.list ?? [], total: res.total, pageNum, pageSize } as any;
  }

  async list(filter?: {
    status?: TaskStatus;
    importance?: number;
    urgency?: number;
    keyword?: string;
    startDate?: Date;
    endDate?: Date;
    goalId?: string;
    parentId?: string;
  }): Promise<TaskDto[]> {
    if (!filter) return await this.findAll();
    const f: any = {} as TaskListFilterDto;
    if (filter.status !== undefined) f.status = filter.status as any;
    if (filter.importance !== undefined)
      f.importance = filter.importance as any;
    if (filter.urgency !== undefined) f.urgency = filter.urgency as any;
    if (filter.keyword) (f as any).keyword = filter.keyword;
    if (filter.startDate) f.startAt = filter.startDate;
    if (filter.endDate) f.endAt = filter.endDate;
    if (filter.goalId) f.goalIds = [filter.goalId];
    if (filter.parentId) (f as any).parentId = filter.parentId;
    return await this.service.findAll(f);
  }

  async taskWithTrackTime(id: string): Promise<TaskWithTrackTimeDto> {
    return await this.service.taskWithTrackTime(id);
  }
}

export const taskService = new TaskService();
