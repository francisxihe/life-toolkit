import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, TreeRepository, In } from "typeorm";
import { Task } from "@life-toolkit/business-server";
import { TodoService } from "../todo/todo.service";
@Injectable()
export class TaskTreeService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly todoService: TodoService
  ) {}

  /** 获取Task树形存储库 */
  getTreeRepo() {
    return this.taskRepository.manager.getTreeRepository(Task);
  }

  /** 更新父数据 */
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
    if (!treeRepo) {
      treeRepo = this.getTreeRepo();
    }
    const parentTask = await treeRepo.findOne({
      where: { id: parentId },
      relations: ["children"],
    });

    if (!parentTask) {
      throw new Error("Parent task not found");
    }

    parentTask.children.push(task);

    await treeRepo.save(parentTask);
  }

  /** 删除子数据 */
  async deleteChildren(task: Task | Task[], treeRepo?: TreeRepository<Task>) {
    if (!treeRepo) {
      treeRepo = this.getTreeRepo();
    }

    const getAllDescendantIds = (node: Task): string[] => {
      const ids = [node.id];
      if (node.children) {
        node.children.forEach((child) => {
          ids.push(...getAllDescendantIds(child));
        });
      }
      return ids;
    };

    const allIds: string[] = [];
    
    if (Array.isArray(task)) {
      for (const t of task) {
        const descendantsTree = await treeRepo.findDescendantsTree(t);
        allIds.push(...getAllDescendantIds(descendantsTree));
      }
    } else {
      const descendantsTree = await treeRepo.findDescendantsTree(task);
      allIds.push(...getAllDescendantIds(descendantsTree));
    }

    await this.todoService.deleteByTaskIds(allIds);

    await treeRepo.delete({
      id: In(allIds),
    });
  }
}
