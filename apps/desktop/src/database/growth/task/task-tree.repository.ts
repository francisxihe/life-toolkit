import { In, TreeRepository } from "typeorm";
import { AppDataSource } from "../../database.config";
import { Task as DesktopTask } from "./task.entity";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskDto,
  Task as BusinessTask,
} from "@life-toolkit/business-server";

export class TaskTreeRepository {
  getTreeRepository(): TreeRepository<BusinessTask> {
    return AppDataSource.getTreeRepository(DesktopTask) as unknown as TreeRepository<BusinessTask>;
  }

  private toDto(entity: DesktopTask): TaskDto {
    const dto: any = {
      id: entity.id,
      createdAt: (entity as any).createdAt,
      updatedAt: (entity as any).updatedAt,
      deletedAt: (entity as any).deletedAt,
      name: entity.name,
      description: entity.description,
      status: (entity as any).status,
      importance: undefined,
      urgency: undefined,
      estimateTime: undefined,
      startAt: undefined,
      endAt: entity.dueDate,
      doneAt: entity.completedAt,
      abandonedAt: undefined,
      tags: entity.tags,
      parent: (entity as any).parent,
      children: (entity as any).children,
      goal: (entity as any).goal,
      goalId: entity.goalId,
      todoList: (entity as any).todoList,
    };
    return dto as TaskDto;
  }

  async findOne(where: any): Promise<BusinessTask | null> {
    const repo = AppDataSource.getTreeRepository(DesktopTask);
    return (await repo.findOne({ where: (where as unknown) as any })) as unknown as BusinessTask | null;
  }

  async createWithParent(dto: CreateTaskDto): Promise<TaskDto> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(DesktopTask);
      const current = treeRepository.create({
        name: dto.name,
        description: dto.description,
        tags: (dto as any).tags,
        goalId: (dto as any).goalId,
        dueDate: (dto as any).endAt,
        status: (dto as any).status,
      });

      if ((dto as any).parentId) {
        const parent = await treeRepository.findOne({ where: { id: (dto as any).parentId } });
        if (!parent) throw new Error(`父任务不存在，ID: ${(dto as any).parentId}`);
        (current as any).parent = parent;
      }

      const saved = await treeRepository.save(current);
      return this.toDto(saved);
    });
  }

  async updateWithParent(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(DesktopTask);
      const current = await treeRepository.findOne({ where: { id } });
      if (!current) throw new Error(`任务不存在，ID: ${id}`);

      if (dto.name !== undefined) (current as any).name = dto.name as any;
      if (dto.description !== undefined) (current as any).description = dto.description as any;
      if ((dto as any).tags !== undefined) (current as any).tags = (dto as any).tags as any;
      if ((dto as any).endAt !== undefined) (current as any).dueDate = (dto as any).endAt as any;
      if ((dto as any).goalId !== undefined) (current as any).goalId = (dto as any).goalId as any;
      if ((dto as any).status !== undefined) (current as any).status = (dto as any).status as any;
      if ((dto as any).doneAt !== undefined) (current as any).completedAt = (dto as any).doneAt as any;

      if ((dto as any).parentId) {
        await this.updateParent({ task: (current as any), parentId: (dto as any).parentId }, treeRepository as any);
      } else if ((dto as any).parentId === null) {
        (current as any).parent = undefined as any;
        await treeRepository.save(current);
      }

      const saved = await treeRepository.save(current);
      return this.toDto(saved);
    });
  }

  async updateParent(params: { task: BusinessTask; parentId: string }, treeRepo?: unknown): Promise<void> {
    const repo = (treeRepo as unknown as TreeRepository<DesktopTask>) ?? AppDataSource.getTreeRepository(DesktopTask);
    const parent = await repo.findOne({ where: { id: params.parentId } });
    if (!parent) throw new Error(`父任务不存在，ID: ${params.parentId}`);
    (params.task as any).parent = parent;
    await repo.save((params.task as unknown) as DesktopTask);
  }

  async computeDescendantIds(target: BusinessTask | BusinessTask[]): Promise<string[]> {
    const repo = AppDataSource.getTreeRepository(DesktopTask);
    const collect = async (t: any): Promise<string[]> => {
      const descendants = await repo.findDescendants((t as unknown) as DesktopTask);
      return descendants.map((n) => (n as any).id);
    };

    if (Array.isArray(target)) {
      const all: string[] = [];
      for (const t of target as any[]) {
        const ids = await collect(t);
        all.push(...ids);
      }
      return Array.from(new Set(all));
    }
    return await collect(target as any);
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    const repo = AppDataSource.getTreeRepository(DesktopTask);
    await repo.softDelete({ id: In(ids) } as any);
  }
}
