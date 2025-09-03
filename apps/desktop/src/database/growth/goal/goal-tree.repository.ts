import { In, TreeRepository, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../database.config';
import { Goal, GoalTreeRepository as _GoalTreeRepository } from '@life-toolkit/business-server';

export class GoalTreeRepository implements _GoalTreeRepository {
  repo: TreeRepository<Goal> = AppDataSource.getTreeRepository(Goal);

  async findRoots(): Promise<Goal[]> {
    return await this.repo.findRoots();
  }

  async findDescendants(entity: Goal): Promise<Goal[]> {
    return await this.repo.findDescendants(entity);
  }

  async findAncestors(entity: Goal): Promise<Goal[]> {
    return await this.repo.findAncestors(entity);
  }

  async findDescendantsTree(entity: Goal): Promise<Goal> {
    return await this.repo.findDescendantsTree(entity);
  }

  async updateParent(currentGoal: Goal, parentId: string, treeRepo?: TreeRepository<Goal>): Promise<void> {
    const repo = treeRepo ?? this.repo;
    const parent = await repo.findOne({ where: { id: parentId } });
    if (!parent) throw new Error(`父目标不存在，ID: ${parentId}`);
    currentGoal.parent = parent;
    await repo.save(currentGoal);
  }

  async deleteDescendants(target: Goal | Goal[], treeRepo?: TreeRepository<Goal>): Promise<void> {
    const repo = treeRepo ?? this.repo;
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
    const repo = this.repo;
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
    status?: Goal['status'];
    keyword?: string;
    importance?: number;
  }): Promise<Set<string>> {
    const treeRepo = this.repo;
    const roots = await treeRepo.findRoots();
    const res = new Set<string>();
    for (const r of roots) {
      const full = await treeRepo.findDescendantsTree(r);
      const traverse = (n: Goal) => {
        if (
          (!filter.status || n.status === filter.status) &&
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

  async deleteWithTree(id: string): Promise<void> {
    const goal = await this.repo.findOne({ where: { id } });
    if (!goal) throw new Error(`目标不存在，ID: ${id}`);
    await this.repo.delete({ id });
  }

  async getFilteredTree(filter: { status?: Goal['status']; keyword?: string; importance?: number }): Promise<Goal[]> {
    const treeRepo = this.repo;
    if (!filter.status && !filter.keyword && !filter.importance) {
      const roots = await treeRepo.findRoots();
      const trees: Goal[] = [];
      for (const r of roots) {
        const full = await this.buildTree(r);
        trees.push(full);
      }
      return trees;
    }

    const includeIds = await this.collectIdsByFilter(filter);
    if (includeIds.size === 0) return [];

    const roots = await treeRepo.findRoots();
    const trees: Goal[] = [];
    for (const r of roots) {
      if (includeIds.has(r.id)) {
        const full = await treeRepo.findDescendantsTree(r);
        const filtered = this.filterTreeNodes(full, includeIds);
        if (filtered) trees.push(filtered);
      }
    }
    return trees;
  }

  async processTreeFilter(filter: {
    excludeIds?: string[];
    parentId?: string;
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }> {
    const treeRepo = this.repo;
    let includeIds: string[] = [];
    let excludeIds: string[] = [];

    if (filter.excludeIds) {
      const nodes = await treeRepo.find({ where: { id: In(filter.excludeIds) } });
      for (const node of nodes) {
        const all = await treeRepo.findDescendants(node);
        excludeIds = all.map((n) => n.id);
        excludeIds.push(node.id);
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
}
