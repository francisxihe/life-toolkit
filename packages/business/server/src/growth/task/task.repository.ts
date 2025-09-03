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
  create(task: Task): Promise<Task>;
  update(taskUpdate: Task): Promise<Task>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TaskListFiltersDto): Promise<void>;
  softDelete(id: string): Promise<void>;
  softDeleteByFilter(filter: TaskListFiltersDto): Promise<void>;
  find(id: string): Promise<Task>;
  findWithRelations(id: string, relations?: string[]): Promise<Task>;
  findAll(filter: TaskListFiltersDto & { excludeIds?: string[] }): Promise<Task[]>;
  page(filter: TaskPageFiltersDto): Promise<{ list: Task[]; total: number; pageNum: number; pageSize: number }>;
}

export interface TaskTreeRepository {
  computeDescendantIds(target: Task | Task[]): Promise<string[]>;
}
