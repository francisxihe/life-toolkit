import { In, TreeRepository } from 'typeorm';
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
}
