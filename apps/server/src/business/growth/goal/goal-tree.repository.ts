import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, In, Like } from 'typeorm';
import { GoalDto, Goal } from '@life-toolkit/business-server';

@Injectable()
export class GoalTreeRepository {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>
  ) {}

  // 获取树形仓库
  getTreeRepository(): TreeRepository<Goal> {
    return this.goalRepository.manager.getTreeRepository(Goal);
  }

  // 树形相关操作
  async findRoots(): Promise<Goal[]> {
    return await this.getTreeRepository().findRoots();
  }

  async findDescendants(entity: Goal): Promise<Goal[]> {
    return await this.getTreeRepository().findDescendants(entity);
  }

  async findAncestors(entity: Goal): Promise<Goal[]> {
    return await this.getTreeRepository().findAncestors(entity);
  }

  async findDescendantsTree(entity: Goal): Promise<Goal> {
    return await this.getTreeRepository().findDescendantsTree(entity);
  }
}
