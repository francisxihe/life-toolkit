import { In, TreeRepository } from 'typeorm';
import { AppDataSource } from '../../database.config';
import { Task } from '@life-toolkit/business-server';
import { TaskTreeRepository as _TaskTreeRepository } from '@life-toolkit/business-server';

export class TaskTreeRepository implements _TaskTreeRepository {
  repo: TreeRepository<Task> = AppDataSource.getTreeRepository(Task);

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
