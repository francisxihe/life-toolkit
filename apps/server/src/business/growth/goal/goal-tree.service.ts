import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, TreeRepository } from "typeorm";
import { Goal } from "./entities";

@Injectable()
export class GoalTreeService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>
  ) {}

  /** 获取Goal树形存储库 */
  getTreeRepo() {
    return this.goalRepository.manager.getTreeRepository(Goal);
  }

  /** 更新父数据 */
  async updateParent(
    {
      currentGoal,
      parentId,
    }: {
      currentGoal: Goal;
      parentId: string;
    },
    treeRepo?: TreeRepository<Goal>
  ) {
    if (!treeRepo) {
      treeRepo = this.getTreeRepo();
    }
    const parent = await treeRepo.findOne({
      where: { id: parentId },
      relations: ["children"],
    });

    if (!parent) {
      throw new Error("Parent goal not found");
    }

    parent.children.push(currentGoal);

    await treeRepo.save(parent);
  }

  /** 删除子数据 */
  async deleteChildren(
    currentGoal: Goal | Goal[],
    treeRepo?: TreeRepository<Goal>
  ) {
    if (!treeRepo) {
      treeRepo = this.getTreeRepo();
    }

    const allIds: string[] = [];
    
    if (Array.isArray(currentGoal)) {
      for (const t of currentGoal) {
        const descendantsNodes = await treeRepo.findDescendants(t);
        allIds.push(...descendantsNodes.map((node) => node.id));
      }
    } else {
      const descendantsNodes = await treeRepo.findDescendants(currentGoal);
      allIds.push(...descendantsNodes.map((node) => node.id));
    }

    await treeRepo.delete(allIds);
  }
}
