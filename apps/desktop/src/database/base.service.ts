import { Repository, DeepPartial, FindOptionsWhere, UpdateResult } from 'typeorm';
import { BaseEntity } from './base.entity';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create({
      ...data,
      id: uuidv4(),
    } as DeepPartial<T>);
    return await this.repository.save(entity);
  }

  async findWithRelations(id: string): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  async findByFilter(): Promise<T[]> {
    return await this.repository.find();
  }

  async update(id: string, data: Partial<T>): Promise<UpdateResult> {
    return await this.repository.update(id, data as any);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findByIds(ids: string[]): Promise<T[]> {
    return await this.repository.findByIds(ids);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
    return count > 0;
  }
}
