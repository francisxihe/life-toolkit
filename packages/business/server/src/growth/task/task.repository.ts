import { Task } from './task.entity';
import { TaskFilterDto } from './dto';
import { BaseRepository } from '@business/common';

export interface TaskRepository extends BaseRepository<Task, TaskFilterDto> {}

export interface TaskTreeRepository {
  computeDescendantIds(target: Task | Task[]): Promise<string[]>;
}
