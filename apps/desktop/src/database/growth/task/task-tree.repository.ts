import { In, TreeRepository, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../database.config';
import { CreateTaskDto, UpdateTaskDto, TaskDto, Task } from '@life-toolkit/business-server';

export class TaskTreeRepository {
  repo: TreeRepository<Task> = AppDataSource.getTreeRepository(Task);

  async findOne(where: FindOptionsWhere<Task> | FindOptionsWhere<Task>[]): Promise<Task | null> {
    const repo = this.repo;
    return await repo.findOne({ where });
  }

  async createWithParent(task: Partial<Task>): Promise<Task> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(Task);
      const current = treeRepository.create(task);

      if (task.parent && task.parent.id) {
        const parent = await treeRepository.findOne({
          where: { id: task.parent.id },
        });
        if (!parent) throw new Error(`父任务不存在，ID: ${task.parent.id}`);
        current.parent = parent;
      }

      return await treeRepository.save(current);
    });
  }

  async updateWithParent(id: string, taskUpdate: Partial<Task>): Promise<Task> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(Task);
      const current = await treeRepository.findOne({ where: { id } });
      if (!current) throw new Error(`任务不存在，ID: ${id}`);

      Object.assign(current, taskUpdate);

      if (taskUpdate.parent) {
        if (taskUpdate.parent.id) {
          const parent = await treeRepository.findOne({
            where: { id: taskUpdate.parent.id },
          });
          if (!parent) throw new Error(`父任务不存在，ID: ${taskUpdate.parent.id}`);
          current.parent = parent;
        } else {
          current.parent = undefined;
        }
      }

      return await treeRepository.save(current);
    });
  }

  async updateParent(params: { task: Task; parentId: string }, treeRepo?: unknown): Promise<void> {
    const repo = (treeRepo as TreeRepository<Task>) ?? this.repo;
    const parent = await repo.findOne({ where: { id: params.parentId } });
    if (!parent) throw new Error(`父任务不存在，ID: ${params.parentId}`);
    params.task.parent = parent;
    await repo.save(params.task);
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

  async deleteByIds(includeIds: string[]): Promise<void> {
    if (!includeIds || includeIds.length === 0) return;
    const repo = this.repo;
    await repo.softDelete({ id: In(includeIds) });
  }
}
