import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  TreeRepository,
  In,
  FindOptionsWhere,
  Like,
} from "typeorm";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalDto,
  Goal,
} from "@life-toolkit/business-server";
import { GoalStatus } from "@life-toolkit/enum";

@Injectable()
export class GoalTreeRepository {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>
  ) {}

  // 获取树形仓库
  getTreeRepository(): TreeRepository<Goal> {
    return this.goalRepository.manager.getTreeRepository(Goal);
  }


  // 树形相关操作
  async findRoots(): Promise<Goal[]> {
    return await this.getTreeRepository().findRoots();
  }

  async findDescendants(entity: Goal): Promise<Goal[]> {
    return await this.getTreeRepository().findDescendants(entity);
  }

  async findAncestors(entity: Goal): Promise<Goal[]> {
    return await this.getTreeRepository().findAncestors(entity);
  }

  async findDescendantsTree(entity: Goal): Promise<Goal> {
    return await this.getTreeRepository().findDescendantsTree(entity);
  }

  async deleteDescendants(
    target: Goal | Goal[],
    treeRepo?: TreeRepository<Goal>
  ) {
    const repo = treeRepo ?? this.getTreeRepository();
    const allIds: string[] = [];

    if (Array.isArray(target)) {
      for (const t of target) {
        const descendantsNodes = await repo.findDescendants(t);
        allIds.push(...descendantsNodes.map((node) => node.id));
      }
    } else {
      const descendantsNodes = await repo.findDescendants(target);
      allIds.push(...descendantsNodes.map((node) => node.id));
    }

    await repo.delete({ id: In(allIds) });
  }

  // 手动构建树（用于特定过滤场景）
  async buildTree(node: Goal): Promise<Goal> {
    const repo = this.getTreeRepository();
    const result = await repo.query(
      `SELECT id, name, status, parent_id FROM goal WHERE parent_id = ? AND deleted_at IS NULL`,
      [node.id]
    );

    const children: Goal[] = [];
    for (const row of result) {
      const child = await repo.findOne({ where: { id: row.id } });
      if (child) {
        const childTree = await this.buildTree(child);
        children.push(childTree);
      }
    }

    node.children = children;
    return node;
  }

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null {
    if (!nodeIdsToInclude.has(node.id)) {
      return null;
    }
    const filteredNode: Goal = { ...node, children: [] } as Goal;
    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map((child: Goal) => this.filterTreeNodes(child, nodeIdsToInclude))
        .filter((child: Goal | null): child is Goal => child !== null);
      filteredNode.children = filteredChildren;
    }
    return filteredNode;
  }

  // 组合过滤查询：根据 status/keyword/importance 返回匹配节点及其祖先ID集合
  async collectIdsByFilter(filter: {
    status?: string;
    keyword?: string;
    importance?: number;
  }): Promise<Set<string>> {
    const repo = this.getTreeRepository();

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.keyword) where.name = Like(`%${filter.keyword}%`);
    if (filter.importance) where.importance = filter.importance;

    const matchingNodes = await repo.find({ where });

    const ids = new Set<string>();
    for (const node of matchingNodes) {
      ids.add(node.id);
      const ancestors = await repo.findAncestors(node);
      ancestors.forEach((a) => ids.add(a.id));
    }
    return ids;
  }


  // 手动树形结构查询和过滤
  async getFilteredTree(filter: {
    status?: string;
    keyword?: string;
    importance?: number;
  }): Promise<GoalDto[]> {
    const treeRepo = this.getTreeRepository();

    // 如果没有过滤条件，直接返回所有根节点的完整树
    if (!filter.status && !filter.keyword && !filter.importance) {
      const rootNodes = await treeRepo.findRoots();
      const trees: GoalDto[] = [];
      for (const root of rootNodes) {
        const tree = await this.buildTree(root);
        trees.push(GoalDto.importEntity(tree));
      }
      return trees;
    }

    // 收集匹配节点及其祖先ID
    const nodeIdsToInclude = await this.collectIdsByFilter(filter);

    if (nodeIdsToInclude.size === 0) {
      return [];
    }

    // 构建过滤后的树形结构
    const allRootNodes = await treeRepo.findRoots();
    const trees: GoalDto[] = [];

    for (const root of allRootNodes) {
      if (nodeIdsToInclude.has(root.id)) {
        const fullTree = await this.buildTree(root);
        const filteredTree = this.filterTreeNodes(fullTree, nodeIdsToInclude);
        if (filteredTree) {
          trees.push(GoalDto.importEntity(filteredTree));
        }
      }
    }

    return trees;
  }

  // 树形过滤逻辑处理（用于 findAll）
  async processTreeFilter(filter: {
    id?: string;
    parentId?: string;
    excludeIds?: string[];
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }> {
    let excludeIds: string[] = filter.excludeIds || [];
    let includeIds: string[] = [];

    const treeRepo = this.getTreeRepository();

    // 处理父级过滤逻辑
    if (filter.parentId) {
      const entity = await treeRepo.findOne({ where: { id: filter.parentId } });
      if (entity) {
        const flatChildren = await treeRepo.findDescendants(entity);
        includeIds = flatChildren.map((child) => child.id);
        includeIds.push(filter.parentId);
      }
    }

    return { includeIds, excludeIds };
  }

}
