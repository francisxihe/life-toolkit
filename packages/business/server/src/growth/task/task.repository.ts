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
  create(task: Partial<Task>): Promise<Task>;
  update(id: string, taskUpdate: Partial<Task>): Promise<Task>;
  removeByIds(ids: string[]): Promise<void>;
  findById(id: string, relations?: string[]): Promise<Task>;
  findAll(filter: TaskListFiltersDto & { excludeIds?: string[] }): Promise<Task[]>;
  page(filter: TaskPageFiltersDto): Promise<{ list: Task[]; total: number; pageNum: number; pageSize: number }>;
  taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto>;
  findByGoalIds(goalIds: string[]): Promise<Task[]>;
}

export interface TaskTreeRepository {
  findOne(where: any): Promise<Task | null>;
  createWithParent(task: Partial<Task>): Promise<Task>;
  updateWithParent(id: string, taskUpdate: Partial<Task>): Promise<Task>;
  updateParent(params: { task: Task; parentId: string }, treeRepo?: unknown): Promise<void>;
  computeDescendantIds(target: Task | Task[]): Promise<string[]>;
  deleteByIds(ids: string[]): Promise<void>;
}

export interface TodoCleanupService {
  deleteByTaskIds(taskIds: string[]): Promise<void>;
}
