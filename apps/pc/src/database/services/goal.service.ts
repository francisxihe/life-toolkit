import { TreeRepository } from "typeorm";
import { Goal, GoalType, GoalStatus } from "../entities/goal.entity";
import { AppDataSource } from "../database.config";
import { v4 as uuidv4 } from "uuid";

export class GoalService {
  private repository: TreeRepository<Goal>;

  constructor() {
    this.repository = AppDataSource.getTreeRepository(Goal);
  }

  async create(goalData: {
    name: string;
    type: GoalType;
    status?: GoalStatus;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    priority?: number;
    parentId?: string;
  }): Promise<Goal> {
    const goal = this.repository.create({
      ...goalData,
      id: uuidv4(),
      status: goalData.status || GoalStatus.TODO,
    });

    if (goalData.parentId) {
      const parent = await this.findById(goalData.parentId);
      if (parent) {
        goal.parent = parent;
      }
    }

    return await this.repository.save(goal);
  }

  async findById(id: string): Promise<Goal | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<Goal[]> {
    return await this.repository.find();
  }

  async findRoots(): Promise<Goal[]> {
    return await this.repository.findRoots();
  }

  async findTree(): Promise<Goal[]> {
    return await this.repository.findTrees();
  }

  async findChildren(parentId: string): Promise<Goal[]> {
    const parent = await this.findById(parentId);
    if (!parent) return [];
    
    return await this.repository.findDescendants(parent);
  }

  async findParent(childId: string): Promise<Goal | null> {
    const child = await this.findById(childId);
    if (!child) return null;
    
    const ancestors = await this.repository.findAncestors(child);
    return ancestors.length > 1 ? ancestors[ancestors.length - 2] : null;
  }

  async update(id: string, data: Partial<Goal>): Promise<void> {
    await this.repository.update(id, data as any);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByType(type: GoalType): Promise<Goal[]> {
    return await this.repository.find({
      where: { type },
    });
  }

  async findByStatus(status: GoalStatus): Promise<Goal[]> {
    return await this.repository.find({
      where: { status },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
    return await this.repository
      .createQueryBuilder('goal')
      .where('goal.startDate >= :startDate', { startDate })
      .andWhere('goal.endDate <= :endDate', { endDate })
      .getMany();
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}

export const goalService = new GoalService();