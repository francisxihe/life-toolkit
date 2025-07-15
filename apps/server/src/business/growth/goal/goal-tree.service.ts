import { Inject, Injectable, forwardRef, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, TreeRepository, In } from "typeorm";
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
      where: { id: parentId }
    });

    if (!parent) {
      throw new NotFoundException(`父目标不存在，ID: ${parentId}`);
    }

    // 设置父子关系
    currentGoal.parent = parent;
    
    // 保存子目标，TypeORM会自动维护closure table
    await treeRepo.save(currentGoal);
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

    await treeRepo.delete({
      id: In(allIds),
    });
  }
} 
