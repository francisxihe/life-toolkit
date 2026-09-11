import { TreeRepository } from 'typeorm';
import { store } from '../../storage';
import { Task } from './task.entity';
import type { TaskTreeRepository as ITaskTreeRepository } from './task.repository';

export class TaskTreeRepository implements ITaskTreeRepository {
  get repo(): TreeRepository<Task> {
    return store().getTreeRepository(Task);
  }

  async computeDescendantIds(target: Task | Task[]): Promise<string[]> {
    const repo = this.repo;
    const collect = async (t: Task): Promise<string[]> => {
      const descendants = await repo.findDescendants(t);
      return descendants.map((n) => n.id);
    };

    if (Array.isArray(target)) {
      const all: string[] = [];
      for (const t of target) {
        const includeIds = await collect(t);
        all.push(...includeIds);
      }
      return Array.from(new Set(all));
    }
    return await collect(target);
  }
}
