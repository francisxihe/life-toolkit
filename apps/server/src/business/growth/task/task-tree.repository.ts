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


}
