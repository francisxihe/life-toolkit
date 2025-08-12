import { TreeRepository } from "typeorm";
import { Task, TaskStatus } from "../entities/task.entity";
import { AppDataSource } from "../database.config";
import { v4 as uuidv4 } from "uuid";

export class TaskService {
  private repository: TreeRepository<Task>;

  constructor() {
    this.repository = AppDataSource.getTreeRepository(Task);
  }

  async create(taskData: {
    name: string;
    status?: TaskStatus;
    description?: string;
    startAt?: Date;
    endAt?: Date;
    estimateTime?: string;
    importance?: number;
    urgency?: number;
    tags?: string[];
    goalId?: string;
    parentId?: string;
  }): Promise<Task> {
    const task = this.repository.create({
      ...taskData,
      id: uuidv4(),
      status: taskData.status || TaskStatus.TODO,
    });

    if (taskData.parentId) {
      const parent = await this.findById(taskData.parentId);
      if (parent) {
        task.parent = parent;
      }
    }

    return await this.repository.save(task);
  }

  async findById(id: string): Promise<Task | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['goal', 'todoList'],
    });
  }

  async findAll(): Promise<Task[]> {
    return await this.repository.find({
      relations: ['goal', 'todoList'],
    });
  }

  async findRoots(): Promise<Task[]> {
    return await this.repository.findRoots();
  }

  async findTree(): Promise<Task[]> {
    return await this.repository.findTrees();
  }

  async findChildren(parentId: string): Promise<Task[]> {
    const parent = await this.findById(parentId);
    if (!parent) return [];
    
    return await this.repository.findDescendants(parent);
  }

  async findParent(childId: string): Promise<Task | null> {
    const child = await this.findById(childId);
    if (!child) return null;
    
    const ancestors = await this.repository.findAncestors(child);
    return ancestors.length > 1 ? ancestors[ancestors.length - 2] : null;
  }

  async update(id: string, data: Partial<Task>): Promise<void> {
    await this.repository.update(id, data as any);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByGoalId(goalId: string): Promise<Task[]> {
    return await this.repository.find({
      where: { goalId },
      relations: ['goal', 'todoList'],
    });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return await this.repository.find({
      where: { status },
      relations: ['goal', 'todoList'],
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return await this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.goal', 'goal')
      .leftJoinAndSelect('task.todoList', 'todoList')
      .where('task.startAt >= :startDate', { startDate })
      .andWhere('task.endAt <= :endDate', { endDate })
      .getMany();
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    const updateData: Partial<Task> = { status };
    
    if (status === TaskStatus.DONE) {
      updateData.completedAt = new Date();
    }
    
    await this.update(id, updateData);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}

export const taskService = new TaskService();