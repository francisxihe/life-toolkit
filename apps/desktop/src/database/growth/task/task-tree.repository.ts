import { In, TreeRepository, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../database.config';
import { CreateTaskDto, UpdateTaskDto, TaskDto, Task } from '@life-toolkit/business-server';

export class TaskTreeRepository {
  repo: TreeRepository<Task> = AppDataSource.getTreeRepository(Task);

  async findOne(where: FindOptionsWhere<Task> | FindOptionsWhere<Task>[]): Promise<Task | null> {
    const repo = this.repo;
    return await repo.findOne({ where });
  }

  async createWithParent(dto: CreateTaskDto): Promise<Task> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(Task);
      const current = treeRepository.create({
        name: dto.name,
        description: dto.description,
        tags: dto.tags,
        goalId: dto.goalId,
        endAt: dto.endAt,
      });

      if (dto.parentId) {
        const parent = await treeRepository.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) throw new Error(`父任务不存在，ID: ${dto.parentId}`);
        current.parent = parent;
      }

      return await treeRepository.save(current);
    });
  }

  async updateWithParent(id: string, dto: UpdateTaskDto): Promise<Task> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(Task);
      const current = await treeRepository.findOne({ where: { id } });
      if (!current) throw new Error(`任务不存在，ID: ${id}`);

      if (dto.name !== undefined) current.name = dto.name;
      if (dto.description !== undefined) current.description = dto.description;
      if (dto.tags !== undefined) current.tags = dto.tags;
      if (dto.endAt !== undefined) current.endAt = dto.endAt;
      if (dto.goalId !== undefined) current.goalId = dto.goalId;
      // status 不在 UpdateTaskDto 范畴，由业务服务单独处理

      if ('parentId' in dto && dto.parentId) {
        const parent = await treeRepository.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) throw new Error(`父任务不存在，ID: ${dto.parentId}`);
        current.parent = parent;
      } else if ('parentId' in dto && dto.parentId === null) {
        current.parent = undefined;
        await treeRepository.save(current);
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
