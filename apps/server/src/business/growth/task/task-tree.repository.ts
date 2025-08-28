import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, TreeRepository, FindOptionsWhere } from "typeorm";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskDto,
  Task,
} from "@life-toolkit/business-server";

@Injectable()
export class TaskTreeRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  getTreeRepository(): TreeRepository<Task> {
    return this.taskRepository.manager.getTreeRepository(Task);
  }

  async findOne(where: FindOptionsWhere<Task> | FindOptionsWhere<Task>[]) {
    const treeRepo = this.getTreeRepository();
    return await treeRepo.findOne({ where, relations: ["children"] });
  }

  async save(entity: Task) {
    const treeRepo = this.getTreeRepository();
    return await treeRepo.save(entity);
  }

  async updateParent(
    {
      task,
      parentId,
    }: {
      task: Task;
      parentId: string;
    },
    treeRepo?: TreeRepository<Task>
  ) {
    const repo = treeRepo ?? this.getTreeRepository();
    const parentTask = await repo.findOne({
      where: { id: parentId },
      relations: ["children"],
    });
    if (!parentTask) throw new NotFoundException("Parent task not found");
    parentTask.children.push(task);
    await repo.save(parentTask);
  }

  async findDescendantsTree(entity: Task) {
    const repo = this.getTreeRepository();
    return await repo.findDescendantsTree(entity);
  }

  getAllDescendantIds(node: Task): string[] {
    const ids = [node.id];
    if (node.children) {
      for (const child of node.children) {
        ids.push(...this.getAllDescendantIds(child));
      }
    }
    return ids;
  }

  async computeDescendantIds(target: Task | Task[]): Promise<string[]> {
    const treeRepo = this.getTreeRepository();
    const allIds: string[] = [];
    if (Array.isArray(target)) {
      for (const t of target) {
        const tree = await treeRepo.findDescendantsTree(t);
        allIds.push(...this.getAllDescendantIds(tree));
      }
    } else {
      const tree = await treeRepo.findDescendantsTree(target);
      allIds.push(...this.getAllDescendantIds(tree));
    }
    return allIds;
  }

  async deleteByIds(ids: string[]) {
    if (!ids.length) return;
    const treeRepo = this.getTreeRepository();
    await treeRepo.delete({ id: In(ids) });
  }

  async createWithParent(dto: CreateTaskDto): Promise<TaskDto> {
    return await this.getTreeRepository().manager.transaction(
      async (manager) => {
        const treeRepo = manager.getTreeRepository(Task);
        const entity = treeRepo.create({ ...dto }) as unknown as Task;
        if (dto.parentId) {
          const parent = await treeRepo.findOne({
            where: { id: dto.parentId },
          });
          if (!parent) throw new NotFoundException("Parent task not found");
          parent.children = parent.children || [];
          parent.children.push(entity);
          await treeRepo.save(parent);
        }
        const saved = (await treeRepo.save(entity)) as unknown as Task;
        return TaskDto.importEntity(saved);
      }
    );
  }

  async updateWithParent(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    return await this.getTreeRepository().manager.transaction(
      async (manager) => {
        const treeRepo = manager.getTreeRepository(Task);
        const entity = await treeRepo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException("Task not found");
        Object.assign(entity, dto);
        if (dto.parentId) {
          await this.updateParent(
            { task: entity, parentId: dto.parentId },
            treeRepo
          );
        } else if (dto.parentId === null) {
          entity.parent = undefined;
          await treeRepo.save(entity);
        }
        const saved = (await treeRepo.save(entity)) as unknown as Task;
        return TaskDto.importEntity(saved);
      }
    );
  }

  async deleteWithTree(id: string): Promise<void> {
    const toDelete = await this.findOne({ id });
    if (!toDelete) throw new NotFoundException("Task not found");
    const ids = await this.computeDescendantIds(toDelete);
    await this.deleteByIds(ids);
  }

  async deleteWithTreeByIds(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const treeRepo = this.getTreeRepository();
    const targets = await treeRepo.find({ where: { id: In(ids) } });
    const all: string[] = [];
    for (const t of targets) {
      const arr = await this.computeDescendantIds(t);
      all.push(...arr);
    }
    await this.deleteByIds(all);
  }
}
