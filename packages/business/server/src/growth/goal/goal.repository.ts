import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { Goal } from './goal.entity';
import { GoalType, GoalStatus } from '@life-toolkit/enum';
import { CreateGoalDto, UpdateGoalDto, GoalPageFiltersDto, GoalListFiltersDto, GoalDto } from './dto';

export interface GoalRepository {
  // 基础 CRUD 操作
  create(goal: Goal): Promise<Goal>;
  findAll(filter: GoalListFiltersDto): Promise<Goal[]>;
  page(filter: GoalPageFiltersDto): Promise<{
    list: Goal[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(goalUpdate: Goal): Promise<Goal>;
  updateByFilter(filter: GoalListFiltersDto, goalUpdate: Goal): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: GoalPageFiltersDto): Promise<void>;
  findById(id: string, relations?: string[]): Promise<Goal>;

  // 细化方法
  findDetail(id: string): Promise<Goal>;

  doneBatch(ids: string[]): Promise<void>;
}

export interface GoalTreeRepository {
  // 基础查询
  findOne(where: FindOptionsWhere<Goal> | FindOptionsWhere<Goal>[]): Promise<Goal | null>;

  save(entity: Goal): Promise<Goal>;

  // 树形相关操作
  findRoots(): Promise<Goal[]>;
  findDescendants(entity: Goal): Promise<Goal[]>;
  findAncestors(entity: Goal): Promise<Goal[]>;

  findDescendantsTree(entity: Goal): Promise<Goal>;

  updateParent(currentGoal: Goal, parentId: string, treeRepo?: unknown): Promise<void>;

  deleteDescendants(target: Goal | Goal[], treeRepo?: unknown): Promise<void>;

  buildTree(node: Goal): Promise<Goal>;

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null;

  collectIdsByFilter(filter: { status?: string; keyword?: string; importance?: number }): Promise<Set<string>>;

  createWithParent(goal: Goal): Promise<Goal>;

  updateWithParent(goalUpdate: Goal): Promise<Goal>;

  deleteWithTree(id: string): Promise<void>;

  getFilteredTree(filter: { status?: string; keyword?: string; importance?: number }): Promise<Goal[]>;

  processTreeFilter(filter: {
    excludeIds?: string[];
    parentId?: string;
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }>;

  findDetail(id: string): Promise<Goal>;
}
