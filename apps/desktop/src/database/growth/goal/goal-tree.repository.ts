import { In, TreeRepository, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../database.config";
import { Goal as DesktopGoal } from "./goal.entity";
import { CreateGoalDto, UpdateGoalDto, GoalDto, Goal as BusinessGoal } from "@life-toolkit/business-server";

export class GoalTreeRepository {
  getTreeRepository(): TreeRepository<BusinessGoal> {
    return AppDataSource.getTreeRepository(DesktopGoal) as unknown as TreeRepository<BusinessGoal>;
  }

  private toDto(entity: DesktopGoal): GoalDto {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      name: entity.name,
      description: entity.description,
      status: entity.status as any,
      type: entity.type as any,
      importance: entity.importance,
      startAt: entity.startDate,
      endAt: entity.targetDate,
      doneAt: entity.completedAt,
      abandonedAt: undefined,
      parent: entity.parent as any,
      children: (entity.children || []) as any,
      priority: entity.priority,
      taskList: (entity.taskList || []) as any,
    } as any;
  }

  async findOne(where: FindOptionsWhere<BusinessGoal> | FindOptionsWhere<BusinessGoal>[]): Promise<BusinessGoal | null> {
    const repo = AppDataSource.getTreeRepository(DesktopGoal);
    return (await repo.findOne({ where: (where as unknown) as any, relations: ["children"] })) as unknown as BusinessGoal | null;
  }

  async remove(entity: BusinessGoal): Promise<void> {
    await AppDataSource.getTreeRepository(DesktopGoal).remove((entity as unknown) as DesktopGoal);
  }

  async save(entity: BusinessGoal): Promise<BusinessGoal> {
    return (await AppDataSource.getTreeRepository(DesktopGoal).save((entity as unknown) as DesktopGoal)) as unknown as BusinessGoal;
  }

  async findRoots(): Promise<BusinessGoal[]> {
    return (await AppDataSource.getTreeRepository(DesktopGoal).findRoots()) as unknown as BusinessGoal[];
  }

  async findDescendants(entity: BusinessGoal): Promise<BusinessGoal[]> {
    return (await AppDataSource.getTreeRepository(DesktopGoal).findDescendants((entity as unknown) as DesktopGoal)) as unknown as BusinessGoal[];
  }

  async findAncestors(entity: BusinessGoal): Promise<BusinessGoal[]> {
    return (await AppDataSource.getTreeRepository(DesktopGoal).findAncestors((entity as unknown) as DesktopGoal)) as unknown as BusinessGoal[];
  }

  async findDescendantsTree(entity: BusinessGoal): Promise<BusinessGoal> {
    return (await AppDataSource.getTreeRepository(DesktopGoal).findDescendantsTree((entity as unknown) as DesktopGoal)) as unknown as BusinessGoal;
  }

  async updateParent(currentGoal: BusinessGoal, parentId: string, treeRepo?: unknown): Promise<void> {
    const repo = (treeRepo as unknown as TreeRepository<DesktopGoal>) ?? AppDataSource.getTreeRepository(DesktopGoal);
    const parent = await repo.findOne({ where: { id: parentId } });
    if (!parent) throw new Error(`父目标不存在，ID: ${parentId}`);
    (currentGoal as any).parent = parent;
    await repo.save((currentGoal as unknown) as DesktopGoal);
  }

  async deleteDescendants(target: BusinessGoal | BusinessGoal[], treeRepo?: unknown): Promise<void> {
    const repo = (treeRepo as unknown as TreeRepository<DesktopGoal>) ?? AppDataSource.getTreeRepository(DesktopGoal);
    const allIds: string[] = [];

    if (Array.isArray(target)) {
      for (const t of target as any[]) {
        const descendantsNodes = await repo.findDescendants(t as DesktopGoal);
        allIds.push(...descendantsNodes.map((node) => node.id));
      }
    } else {
      const descendantsNodes = await repo.findDescendants((target as unknown) as DesktopGoal);
      allIds.push(...descendantsNodes.map((node) => node.id));
    }

    await repo.delete({ id: In(allIds) });
  }

  async buildTree(node: BusinessGoal): Promise<BusinessGoal> {
    const repo = AppDataSource.getTreeRepository(DesktopGoal);
    const tree = await repo.findDescendantsTree((node as unknown) as DesktopGoal);
    // 过滤软删除
    const filterDeleted = (n: DesktopGoal): DesktopGoal | null => {
      if (n.deletedAt) return null;
      const children: DesktopGoal[] = [];
      for (const c of n.children || []) {
        const fc = filterDeleted(c);
        if (fc) children.push(fc);
      }
      n.children = children;
      return n;
    };
    const filtered = filterDeleted(tree);
    return (filtered || (node as unknown as DesktopGoal)) as unknown as BusinessGoal;
  }

  filterTreeNodes(node: BusinessGoal, nodeIdsToInclude: Set<string>): BusinessGoal | null {
    const n = node as any;
    if (!nodeIdsToInclude.has(n.id)) return null;
    const clone: any = { ...n, children: [] };
    if (Array.isArray(n.children) && n.children.length > 0) {
      const filteredChildren = (n.children as any[])
        .map((child) => this.filterTreeNodes(child as any, nodeIdsToInclude))
        .filter((child): child is any => child !== null) as any[];
      clone.children = filteredChildren;
    }
    return clone as BusinessGoal;
  }

  async collectIdsByFilter(filter: { status?: string; keyword?: string; importance?: number; }): Promise<Set<string>> {
    const treeRepo = AppDataSource.getTreeRepository(DesktopGoal);
    const roots = await treeRepo.findRoots();
    const res = new Set<string>();
    for (const r of roots) {
      const full = await treeRepo.findDescendantsTree(r);
      const traverse = (n: DesktopGoal) => {
        if (
          (!filter.status || (n.status as any) === filter.status) &&
          (!filter.keyword || n.name.includes(filter.keyword) || (n.description || '').includes(filter.keyword)) &&
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
      const treeRepository = manager.getTreeRepository(DesktopGoal);
      const current = treeRepository.create({
        name: dto.name,
        description: dto.description,
        type: dto.type as any,
        status: (dto as any).status,
        importance: dto.importance as any,
        startDate: dto.startAt,
        targetDate: dto.endAt,
      });

      if (dto.parentId) {
        const parent = await treeRepository.findOne({ where: { id: dto.parentId } });
        if (!parent) throw new Error(`父目标不存在，ID: ${dto.parentId}`);
        current.parent = parent;
      }

      const saved = await treeRepository.save(current);
      return this.toDto(saved);
    });
  }

  async updateWithParent(id: string, dto: UpdateGoalDto): Promise<GoalDto> {
    return await AppDataSource.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(DesktopGoal);
      const current = await treeRepository.findOne({ where: { id } });
      if (!current) throw new Error(`目标不存在，ID: ${id}`);

      if (dto.name !== undefined) current.name = dto.name;
      if (dto.description !== undefined) current.description = dto.description;
      if (dto.type !== undefined) current.type = dto.type as any;
      if (dto.importance !== undefined) current.importance = dto.importance as any;
      if (dto.status !== undefined) current.status = dto.status as any;
      if (dto.startAt !== undefined) current.startDate = dto.startAt;
      if (dto.endAt !== undefined) current.targetDate = dto.endAt;

      if ((dto as any).parentId) {
        await this.updateParent(current as any, (dto as any).parentId, treeRepository);
      } else if ((dto as any).parentId === null) {
        current.parent = undefined as any;
        await treeRepository.save(current);
      }

      const saved = await treeRepository.save(current);
      return this.toDto(saved);
    });
  }

  async deleteWithTree(id: string): Promise<void> {
    const goal = await this.findOne({ id });
    if (!goal) throw new Error(`目标不存在，ID: ${id}`);
    await this.remove(goal as any);
  }

  async getFilteredTree(filter: { status?: string; keyword?: string; importance?: number; }): Promise<GoalDto[]> {
    const treeRepo = AppDataSource.getTreeRepository(DesktopGoal);
    if (!filter.status && !filter.keyword && !filter.importance) {
      const roots = await treeRepo.findRoots();
      const trees: GoalDto[] = [];
      for (const r of roots) {
        const full = await this.buildTree(r as any);
        trees.push(this.toDto(full as any));
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
        if (filtered) trees.push(this.toDto(filtered as any));
      }
    }
    return trees;
  }

  async processTreeFilter(filter: { withoutSelf?: boolean; id?: string; parentId?: string; }): Promise<{ includeIds?: string[]; excludeIds?: string[]; }> {
    const treeRepo = AppDataSource.getTreeRepository(DesktopGoal);
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
    const treeRepo = AppDataSource.getTreeRepository(DesktopGoal);
    const entity = await treeRepo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);

    const withChildren = await treeRepo.findDescendantsTree(entity);
    const withRelations = await treeRepo.findOne({ where: { id }, relations: ["parent", "taskList"] });
    if (withRelations) {
      (withChildren as any).parent = withRelations.parent;
      (withChildren as any).taskList = (withRelations as any).taskList;
    }

    return this.toDto(withChildren);
  }
}
