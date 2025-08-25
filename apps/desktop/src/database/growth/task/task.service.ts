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
  private treeRepoAdapter: DesktopTaskTreeRepository;

  constructor() {
    const repo = new DesktopTaskRepository();
    const treeRepoAdapter = new DesktopTaskTreeRepository();
    const todoCleanup = new DesktopTodoCleanupService();
    this.service = new BusinessTaskService(
      repo as any,
      treeRepoAdapter as any,
      todoCleanup as any
    );
    this.treeRepoAdapter = treeRepoAdapter;
  }

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    return await this.service.create(dto);
  }

  async findById(id: string): Promise<TaskDto> {
    return await this.service.findById(id);
  }

  async findAll(): Promise<TaskDto[]> {
    return await this.service.findAll({} as TaskListFilterDto);
  }

  async findTree(): Promise<Task[]> {
    // 使用桌面树仓储的原生树查询，保持 IPC 兼容（结构为实体树）
    const repo = this.treeRepoAdapter.getTreeRepository();
    return (await repo.findTrees()) as unknown as Task[];
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    return await this.service.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async findByGoalId(goalId: string): Promise<TaskDto[]> {
    return await this.service.findAll({ goalIds: [goalId] } as any);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    await this.service.update(id, { status: status as any } as UpdateTaskDto);
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

  async list(filter?: TaskListFilterDto): Promise<TaskDto[]> {
    return await this.service.findAll((filter || {}) as TaskListFilterDto);
  }

  async taskWithTrackTime(id: string): Promise<TaskWithTrackTimeDto> {
    return await this.service.taskWithTrackTime(id);
  }
}

export const taskService = new TaskService();

