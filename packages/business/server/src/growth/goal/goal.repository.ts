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
}
