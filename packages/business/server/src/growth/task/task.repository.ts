import { Task } from "./task.entity";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFiltersDto,
  TaskListFiltersDto,
  TaskDto,
  TaskWithTrackTimeDto,
} from "./dto";

export interface TaskRepository {
  create(createTaskDto: CreateTaskDto): Promise<Task>;
  update(id: string, updateTaskDto: UpdateTaskDto): Promise<void>;
  removeByIds(ids: string[]): Promise<void>;
  findById(id: string, relations?: string[]): Promise<TaskDto>;
  findAll(filter: TaskListFiltersDto & { excludeIds?: string[] }): Promise<TaskDto[]>;
  page(filter: TaskPageFiltersDto): Promise<{ list: TaskDto[]; total: number }>;
  taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto>;
  findByGoalIds(goalIds: string[]): Promise<Task[]>;
}

export interface TaskTreeRepository {
  findOne(where: any): Promise<Task | null>;
  createWithParent(dto: CreateTaskDto): Promise<TaskDto>;
  updateWithParent(id: string, dto: UpdateTaskDto): Promise<TaskDto>;
  updateParent(params: { task: Task; parentId: string }, treeRepo?: unknown): Promise<void>;
  computeDescendantIds(target: Task | Task[]): Promise<string[]>;
  deleteByIds(ids: string[]): Promise<void>;
}

export interface TodoCleanupService {
  deleteByTaskIds(taskIds: string[]): Promise<void>;
}
