import { Goal } from './goal.entity';
import { GoalFilterDto } from './dto';
import { BaseRepository } from '@business/common';

export interface GoalRepository extends BaseRepository<Goal, GoalFilterDto> {}

export interface GoalTreeRepository {
  // 树形相关操作
  findRoots(): Promise<Goal[]>;
  findDescendants(entity: Goal): Promise<Goal[]>;
  findAncestors(entity: Goal): Promise<Goal[]>;

  findDescendantsTree(entity: Goal): Promise<Goal>;

  deleteDescendants(target: Goal | Goal[], treeRepo?: unknown): Promise<void>;

  buildTree(node: Goal): Promise<Goal>;

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null;

  collectIdsByFilter(filter: { status?: Goal['status']; keyword?: string; importance?: number }): Promise<Set<string>>;

  getFilteredTree(filter: { status?: Goal['status']; keyword?: string; importance?: number }): Promise<Goal[]>;

  processTreeFilter(filter: {
    excludeIds?: string[];
    parentId?: string;
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }>;
}
