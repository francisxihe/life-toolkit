import { In, TreeRepository, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskDto,
  Task,
  TaskMapper,
} from "@life-toolkit/business-server";

export class TaskTreeRepository {
  getTreeRepository(): TreeRepository<Task> {
    return AppDataSource.getTreeRepository(Task);
  }

  async findOne(
    where: FindOptionsWhere<Task> | FindOptionsWhere<Task>[]
  ): Promise<Task | null> {
    const repo = AppDataSource.getTreeRepository(Task);
    return await repo.findOne({ where });
  }

  async createWithParent(dto: CreateTaskDto): Promise<TaskDto> {
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

      const saved = await treeRepository.save(current);
      return TaskMapper.entityToDto(saved);
    });
  }

  async updateWithParent(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
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

      if ("parentId" in dto && dto.parentId) {
        const parent = await treeRepository.findOne({ where: { id: dto.parentId } });
        if (!parent) throw new Error(`父任务不存在，ID: ${dto.parentId}`);
        current.parent = parent;
      } else if ("parentId" in dto && dto.parentId === null) {
        current.parent = undefined;
        await treeRepository.save(current);
      }

      const saved = await treeRepository.save(current);
      return TaskMapper.entityToDto(saved);
    });
  }

  async updateParent(
    params: { task: Task; parentId: string },
    treeRepo?: unknown
  ): Promise<void> {
    const repo = (treeRepo as TreeRepository<Task>) ?? AppDataSource.getTreeRepository(Task);
    const parent = await repo.findOne({ where: { id: params.parentId } });
    if (!parent) throw new Error(`父任务不存在，ID: ${params.parentId}`);
    params.task.parent = parent;
    await repo.save(params.task);
  }

  async computeDescendantIds(target: Task | Task[]): Promise<string[]> {
    const repo = AppDataSource.getTreeRepository(Task);
    const collect = async (t: Task): Promise<string[]> => {
      const descendants = await repo.findDescendants(t);
      return descendants.map((n) => n.id);
    };

    if (Array.isArray(target)) {
      const all: string[] = [];
      for (const t of target) {
        const ids = await collect(t);
        all.push(...ids);
      }
      return Array.from(new Set(all));
    }
    return await collect(target);
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    const repo = AppDataSource.getTreeRepository(Task);
    await repo.softDelete({ id: In(ids) });
  }
}
