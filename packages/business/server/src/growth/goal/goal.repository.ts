import { FindOptionsWhere } from "typeorm";
import { Goal } from "./goal.entity";
import { GoalStatus } from "./goal.enum";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";

export interface GoalRepository {
  // 基础 CRUD 操作
  create(createGoalDto: CreateGoalDto): Promise<GoalDto>;

  findById(id: string, relations?: string[]): Promise<GoalDto>;

  findAll(filter: GoalListFilterDto): Promise<GoalDto[]>;

  page(filter: GoalPageFilterDto): Promise<{ list: GoalDto[]; total: number }>;

  update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto>;

  remove(id: string): Promise<void>;

  softDelete(id: string): Promise<void>;

  batchUpdate(ids: string[], updateData: Partial<Goal>): Promise<void>;
  // 细化方法
  findDetail(id: string): Promise<GoalDto>;

  updateStatus(
    id: string,
    status: GoalStatus,
    extra: Partial<Goal>
  ): Promise<void>;

  batchDone(ids: string[]): Promise<void>;
}

export interface GoalTreeRepository {
  // 基础查询
  findOne(
    where: FindOptionsWhere<Goal> | FindOptionsWhere<Goal>[]
  ): Promise<Goal | null>;

  remove(entity: Goal): Promise<void>;

  save(entity: Goal): Promise<Goal>;

  // 树形相关操作
  findRoots(): Promise<Goal[]>;
  findDescendants(entity: Goal): Promise<Goal[]>;
  findAncestors(entity: Goal): Promise<Goal[]>;

  findDescendantsTree(entity: Goal): Promise<Goal>;

  updateParent(
    currentGoal: Goal,
    parentId: string,
    treeRepo?: unknown
  ): Promise<void>;

  deleteDescendants(
    target: Goal | Goal[],
    treeRepo?: unknown
  ): Promise<void>;

  buildTree(node: Goal): Promise<Goal>;

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null;

  collectIdsByFilter(filter: {
    status?: string;
    keyword?: string;
    importance?: number;
  }): Promise<Set<string>>;

  createWithParent(dto: CreateGoalDto): Promise<GoalDto>;

  updateWithParent(id: string, dto: UpdateGoalDto): Promise<GoalDto>;

  deleteWithTree(id: string): Promise<void>;

  getFilteredTree(filter: {
    status?: string;
    keyword?: string;
    importance?: number;
  }): Promise<GoalDto[]>;

  processTreeFilter(filter: {
    withoutSelf?: boolean;
    id?: string;
    parentId?: string;
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }>;

  findDetail(id: string): Promise<GoalDto>;
}
