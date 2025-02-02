import { BaseEntity } from "./base.entity";
import {
  DeepPartial,
  Repository,
  UpdateResult,
  FindOptionsWhere,
} from "typeorm";
import { NotFoundException } from "@nestjs/common";

export abstract class BaseService<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
    if (!entity) {
      throw new NotFoundException(`Entity #${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateData: DeepPartial<T>): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundException(`Entity #${id} not found`);
    }
    Object.assign(entity, updateData);
    return this.repository.save(entity);
  }

  async delete(id: string): Promise<UpdateResult> {
    return this.repository.softDelete(id);
  }
}
