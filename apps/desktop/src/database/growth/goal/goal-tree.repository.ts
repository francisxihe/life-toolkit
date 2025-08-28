import { In, TreeRepository, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalDto,
  Goal,
} from "@life-toolkit/business-server";

export class GoalTreeRepository {
  getTreeRepository(): TreeRepository<Goal> {
    return AppDataSource.getTreeRepository(Goal);
  }

  async findOne(
    where: FindOptionsWhere<Goal> | FindOptionsWhere<Goal>[]
  ): Promise<Goal | null> {
    const repo = AppDataSource.getTreeRepository(Goal);
    return await repo.findOne({
      where,
      relations: ["children"],
    });
  }

  async remove(entity: Goal): Promise<void> {
    await AppDataSource.getTreeRepository(Goal).remove(entity);
  }

  async save(entity: Goal): Promise<Goal> {
    return await AppDataSource.getTreeRepository(Goal).save(entity);
  }

  async findRoots(): Promise<Goal[]> {
    return await AppDataSource.getTreeRepository(Goal).findRoots();
  }

  async findDescendants(entity: Goal): Promise<Goal[]> {
    return await AppDataSource.getTreeRepository(Goal).findDescendants(entity);
  }

  async findAncestors(entity: Goal): Promise<Goal[]> {
    return await AppDataSource.getTreeRepository(Goal).findAncestors(entity);
  }

  async findDescendantsTree(entity: Goal): Promise<Goal> {
    return await AppDataSource.getTreeRepository(Goal).findDescendantsTree(
      entity
    );
  }

  async updateParent(
    currentGoal: Goal,
    parentId: string,
    treeRepo?: TreeRepository<Goal>
  ): Promise<void> {
    const repo = treeRepo ?? AppDataSource.getTreeRepository(Goal);
    const parent = await repo.findOne({ where: { id: parentId } });
    if (!parent) throw new Error(`父目标不存在，ID: ${parentId}`);
    currentGoal.parent = parent;
    await repo.save(currentGoal);
  }

  async deleteDescendants(
    target: Goal | Goal[],
    treeRepo?: TreeRepository<Goal>
  ): Promise<void> {
    const repo = treeRepo ?? AppDataSource.getTreeRepository(Goal);
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

  async buildTree(node: Goal): Promise<Goal> {
    const repo = AppDataSource.getTreeRepository(Goal);
    const tree = await repo.findDescendantsTree(node);
    // 过滤软删除
    const filterDeleted = (n: Goal): Goal | null => {
      if (n.deletedAt) return null;
      const children: Goal[] = [];
      for (const c of n.children || []) {
        const fc = filterDeleted(c);
        if (fc) children.push(fc);
      }
      n.children = children;
      return n;
    };
    const filtered = filterDeleted(tree);
    return filtered || node;
  }

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null {
    if (!nodeIdsToInclude.has(node.id)) return null;
    const children: Goal[] = [];
    for (const child of node.children || []) {
      const fc = this.filterTreeNodes(child, nodeIdsToInclude);
      if (fc) children.push(fc);
    }
    return { ...node, children } as Goal;
  }

  async collectIdsByFilter(filter: {
    status?: Goal["status"];
    keyword?: string;
    importance?: number;
  }): Promise<Set<string>> {
    const treeRepo = AppDataSource.getTreeRepository(Goal);
    const roots = await treeRepo.findRoots();
    const res = new Set<string>();
    for (const r of roots) {
      const full = await treeRepo.findDescendantsTree(r);
      const traverse = (n: Goal) => {
        if (
          (!filter.status || n.status === filter.status) &&
          (!filter.keyword ||
            n.name.includes(filter.keyword) ||
            (n.description || "").includes(filter.keyword)) &&
          (!filter.importance || n.importance === filter.importance)
        ) {
          res.add(n.id);
        }
        for (const c of n.children || []) traverse(c);
      };
      traverse(full);
    }
    return res;
  }

  async createWithParent(dto: CreateGoalDto): Promise<GoalDto> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(Goal);
      const current = treeRepository.create({
        name: dto.name,
        description: dto.description,
        type: dto.type,
        status: dto.status,
        importance: dto.importance,
        startAt: dto.startAt,
        endAt: dto.endAt,
      });

      if (dto.parentId) {
        const parent = await treeRepository.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) throw new Error(`父目标不存在，ID: ${dto.parentId}`);
        current.parent = parent;
      }

      const saved = await treeRepository.save(current);
      return GoalDto.importEntity(saved);
    });
  }

  async updateWithParent(id: string, dto: UpdateGoalDto): Promise<GoalDto> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(Goal);
      const current = await treeRepository.findOne({ where: { id } });
      if (!current) throw new Error(`目标不存在，ID: ${id}`);

      if (dto.name !== undefined) current.name = dto.name;
      if (dto.description !== undefined) current.description = dto.description;
      if (dto.type !== undefined) current.type = dto.type;
      if (dto.importance !== undefined) current.importance = dto.importance;
      if (dto.status !== undefined) current.status = dto.status;
      if (dto.startAt !== undefined) current.startAt = dto.startAt;
      if (dto.endAt !== undefined) current.endAt = dto.endAt;

      if ("parentId" in dto && dto.parentId) {
        await this.updateParent(current, dto.parentId, treeRepository);
      } else if ("parentId" in dto && dto.parentId === null) {
        current.parent = undefined;
        await treeRepository.save(current);
      }

      const saved = await treeRepository.save(current);
      return GoalDto.importEntity(saved);
    });
  }

  async deleteWithTree(id: string): Promise<void> {
    const goal = await this.findOne({ id });
    if (!goal) throw new Error(`目标不存在，ID: ${id}`);
    await this.remove(goal);
  }

  async getFilteredTree(filter: {
    status?: Goal["status"];
    keyword?: string;
    importance?: number;
  }): Promise<GoalDto[]> {
    const treeRepo = AppDataSource.getTreeRepository(Goal);
    if (!filter.status && !filter.keyword && !filter.importance) {
      const roots = await treeRepo.findRoots();
      const trees: GoalDto[] = [];
      for (const r of roots) {
        const full = await this.buildTree(r);
        trees.push(GoalDto.importEntity(full));
      }
      return trees;
    }

    const includeIds = await this.collectIdsByFilter(filter);
    if (includeIds.size === 0) return [];

    const roots = await treeRepo.findRoots();
    const trees: GoalDto[] = [];
    for (const r of roots) {
      if (includeIds.has(r.id)) {
        const full = await this.buildTree(r);
        const filtered = this.filterTreeNodes(full, includeIds);
        if (filtered) trees.push(GoalDto.importEntity(filtered));
      }
    }
    return trees;
  }

  async processTreeFilter(filter: {
    withoutSelf?: boolean;
    id?: string;
    parentId?: string;
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }> {
    const treeRepo = AppDataSource.getTreeRepository(Goal);
    let includeIds: string[] = [];
    let excludeIds: string[] = [];

    if (filter.withoutSelf && filter.id) {
      const node = await treeRepo.findOne({ where: { id: filter.id } });
      if (node) {
        const all = await treeRepo.findDescendants(node);
        excludeIds = all.map((n) => n.id);
        excludeIds.push(filter.id);
      }
    }

    if (filter.parentId) {
      const parent = await treeRepo.findOne({ where: { id: filter.parentId } });
      if (parent) {
        const all = await treeRepo.findDescendants(parent);
        includeIds = all.map((n) => n.id);
        includeIds.push(filter.parentId);
      }
    }

    return { includeIds, excludeIds };
  }

  async findDetail(id: string): Promise<GoalDto> {
    const treeRepo = AppDataSource.getTreeRepository(Goal);
    const entity = await treeRepo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);

    const withChildren = await treeRepo.findDescendantsTree(entity);
    const withRelations = await treeRepo.findOne({
      where: { id },
      relations: ["parent", "taskList"],
    });
    if (withRelations) {
      withChildren.parent = withRelations.parent;
      // 仅同步引用集合
      (withChildren as any).taskList = (withRelations as any).taskList;
    }

    return GoalDto.importEntity(withChildren);
  }
}
