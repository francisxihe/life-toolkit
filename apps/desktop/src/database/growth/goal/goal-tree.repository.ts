import { In, TreeRepository, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalDto,
  Goal,
  GoalMapper,
} from "@life-toolkit/business-server";

export class GoalTreeRepository {
  getTreeRepository(): TreeRepository<Goal> {
    return AppDataSource.getTreeRepository(Goal);
  }

  async findOne(
    where: FindOptionsWhere<Goal> | FindOptionsWhere<Goal>[]
  ): Promise<Goal | null> {
    const repo = AppDataSource.getTreeRepository(Goal);
    return (await repo.findOne({
      where: where as unknown as any,
      relations: ["children"],
    })) as unknown as Goal | null;
  }

  async remove(entity: Goal): Promise<void> {
    await AppDataSource.getTreeRepository(Goal).remove(
      entity as unknown as Goal
    );
  }

  async save(entity: Goal): Promise<Goal> {
    return (await AppDataSource.getTreeRepository(Goal).save(
      entity as unknown as Goal
    )) as unknown as Goal;
  }

  async findRoots(): Promise<Goal[]> {
    return (await AppDataSource.getTreeRepository(
      Goal
    ).findRoots()) as unknown as Goal[];
  }

  async findDescendants(entity: Goal): Promise<Goal[]> {
    return (await AppDataSource.getTreeRepository(Goal).findDescendants(
      entity as unknown as Goal
    )) as unknown as Goal[];
  }

  async findAncestors(entity: Goal): Promise<Goal[]> {
    return (await AppDataSource.getTreeRepository(Goal).findAncestors(
      entity as unknown as Goal
    )) as unknown as Goal[];
  }

  async findDescendantsTree(entity: Goal): Promise<Goal> {
    return (await AppDataSource.getTreeRepository(Goal).findDescendantsTree(
      entity as unknown as Goal
    )) as unknown as Goal;
  }

  async updateParent(
    currentGoal: Goal,
    parentId: string,
    treeRepo?: unknown
  ): Promise<void> {
    const repo =
      (treeRepo as unknown as TreeRepository<Goal>) ??
      AppDataSource.getTreeRepository(Goal);
    const parent = await repo.findOne({ where: { id: parentId } });
    if (!parent) throw new Error(`父目标不存在，ID: ${parentId}`);
    (currentGoal as any).parent = parent;
    await repo.save(currentGoal as unknown as Goal);
  }

  async deleteDescendants(
    target: Goal | Goal[],
    treeRepo?: unknown
  ): Promise<void> {
    const repo =
      (treeRepo as unknown as TreeRepository<Goal>) ??
      AppDataSource.getTreeRepository(Goal);
    const allIds: string[] = [];

    if (Array.isArray(target)) {
      for (const t of target as any[]) {
        const descendantsNodes = await repo.findDescendants(t as Goal);
        allIds.push(...descendantsNodes.map((node) => node.id));
      }
    } else {
      const descendantsNodes = await repo.findDescendants(
        target as unknown as Goal
      );
      allIds.push(...descendantsNodes.map((node) => node.id));
    }

    await repo.delete({ id: In(allIds) });
  }

  async buildTree(node: Goal): Promise<Goal> {
    const repo = AppDataSource.getTreeRepository(Goal);
    const tree = await repo.findDescendantsTree(node as unknown as Goal);
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
    return (filtered || (node as unknown as Goal)) as unknown as Goal;
  }

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null {
    const n = node as any;
    if (!nodeIdsToInclude.has(n.id)) return null;
    const clone: any = { ...n, children: [] };
    if (Array.isArray(n.children) && n.children.length > 0) {
      const filteredChildren = (n.children as any[])
        .map((child) => this.filterTreeNodes(child as any, nodeIdsToInclude))
        .filter((child): child is any => child !== null) as any[];
      clone.children = filteredChildren;
    }
    return clone as Goal;
  }

  async collectIdsByFilter(filter: {
    status?: string;
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
          (!filter.status || (n.status as any) === filter.status) &&
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
        type: dto.type as any,
        status: (dto as any).status,
        importance: dto.importance as any,
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
      return GoalMapper.entityToDto(saved);
    });
  }

  async updateWithParent(id: string, dto: UpdateGoalDto): Promise<GoalDto> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(Goal);
      const current = await treeRepository.findOne({ where: { id } });
      if (!current) throw new Error(`目标不存在，ID: ${id}`);

      if (dto.name !== undefined) current.name = dto.name;
      if (dto.description !== undefined) current.description = dto.description;
      if (dto.type !== undefined) current.type = dto.type as any;
      if (dto.importance !== undefined)
        current.importance = dto.importance as any;
      if (dto.status !== undefined) current.status = dto.status as any;
      if (dto.startAt !== undefined) current.startAt = dto.startAt;
      if (dto.endAt !== undefined) current.endAt = dto.endAt;

      if ((dto as any).parentId) {
        await this.updateParent(
          current as any,
          (dto as any).parentId,
          treeRepository
        );
      } else if ((dto as any).parentId === null) {
        current.parent = undefined as any;
        await treeRepository.save(current);
      }

      const saved = await treeRepository.save(current);
      return GoalMapper.entityToDto(saved);
    });
  }

  async deleteWithTree(id: string): Promise<void> {
    const goal = await this.findOne({ id });
    if (!goal) throw new Error(`目标不存在，ID: ${id}`);
    await this.remove(goal as any);
  }

  async getFilteredTree(filter: {
    status?: string;
    keyword?: string;
    importance?: number;
  }): Promise<GoalDto[]> {
    const treeRepo = AppDataSource.getTreeRepository(Goal);
    if (!filter.status && !filter.keyword && !filter.importance) {
      const roots = await treeRepo.findRoots();
      const trees: GoalDto[] = [];
      for (const r of roots) {
        const full = await this.buildTree(r as any);
        trees.push(GoalMapper.entityToDto(full as any));
      }
      return trees;
    }

    const includeIds = await this.collectIdsByFilter(filter);
    if (includeIds.size === 0) return [];

    const roots = await treeRepo.findRoots();
    const trees: GoalDto[] = [];
    for (const r of roots) {
      if (includeIds.has(r.id)) {
        const full = await this.buildTree(r as any);
        const filtered = this.filterTreeNodes(full as any, includeIds);
        if (filtered) trees.push(GoalMapper.entityToDto(filtered as any));
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
      (withChildren as any).parent = withRelations.parent;
      (withChildren as any).taskList = (withRelations as any).taskList;
    }

    return GoalMapper.entityToDto(withChildren);
  }
}
