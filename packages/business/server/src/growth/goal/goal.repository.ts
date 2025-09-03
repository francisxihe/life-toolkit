import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { Goal } from './goal.entity';
import { GoalType, GoalStatus } from '@life-toolkit/enum';
import { CreateGoalDto, UpdateGoalDto, GoalPageFiltersDto, GoalListFiltersDto, GoalDto } from './dto';

export interface GoalRepository {
  // 基础 CRUD 操作
  create(goal: Goal): Promise<Goal>;
  update(goalUpdate: Goal): Promise<Goal>;
  updateByFilter(filter: GoalListFiltersDto, goalUpdate: Goal): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: GoalPageFiltersDto): Promise<void>;
  softDelete(id: string): Promise<void>;
  softDeleteByFilter(filter: GoalListFiltersDto): Promise<void>;
  find(id: string): Promise<Goal>;
  findWithRelations(id: string, relations?: string[]): Promise<Goal>;
  findAll(filter: GoalListFiltersDto): Promise<Goal[]>;
  page(filter: GoalPageFiltersDto): Promise<{
    list: Goal[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
}

export interface GoalTreeRepository {
  // 树形相关操作
  findRoots(): Promise<Goal[]>;
  findDescendants(entity: Goal): Promise<Goal[]>;
  findAncestors(entity: Goal): Promise<Goal[]>;

  findDescendantsTree(entity: Goal): Promise<Goal>;

  deleteDescendants(target: Goal | Goal[], treeRepo?: unknown): Promise<void>;

  buildTree(node: Goal): Promise<Goal>;

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null;

  collectIdsByFilter(filter: { status?: string; keyword?: string; importance?: number }): Promise<Set<string>>;

  getFilteredTree(filter: { status?: string; keyword?: string; importance?: number }): Promise<Goal[]>;

  processTreeFilter(filter: {
    excludeIds?: string[];
    parentId?: string;
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }>;
}
