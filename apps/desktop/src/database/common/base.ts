import { Repository, SelectQueryBuilder, DeleteResult, UpdateResult } from 'typeorm';
import { BaseEntity } from '@life-toolkit/business-server';

export class BaseRepository<Entity extends BaseEntity, FilterDto> {
  repo: Repository<Entity>;
  buildQuery: (filter: FilterDto) => SelectQueryBuilder<Entity>;

  constructor(repo: Repository<Entity>, buildQuery: (filter: FilterDto) => SelectQueryBuilder<Entity>) {
    this.repo = repo;
    this.buildQuery = buildQuery;
  }

  async create(goal: Entity): Promise<Entity> {
    const saved = await this.repo.save(goal);
    return this.find(saved.id);
  }

  async delete(id: Entity['id']): Promise<DeleteResult> {
    return await this.repo.delete(id);
  }

  async deleteByFilter(filter: FilterDto): Promise<DeleteResult> {
    const qb = this.buildQuery(filter);
    return await qb.delete().execute();
  }

  async softDelete(id: Entity['id']): Promise<DeleteResult> {
    return await this.repo.softDelete(id);
  }

  async softDeleteByFilter(filter: FilterDto): Promise<DeleteResult> {
    const qb = this.buildQuery(filter);
    return await qb.softDelete().execute();
  }

  async update(updateEntity: Entity): Promise<Entity> {
    const saved = await this.repo.save(updateEntity);
    return this.find(saved.id);
  }

  async updateByFilter(filter: FilterDto, updateEntity: Entity): Promise<UpdateResult> {
    const qb = this.buildQuery(filter);
    return await qb.update(updateEntity as any).execute();
  }

  async find(id: Entity['id']): Promise<Entity> {
    const entity = await this.repo.findOne({ where: { id: id as any } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return entity;
  }

  async findByFilter(filter: FilterDto): Promise<Entity[]> {
    const qb = this.buildQuery(filter);
    return await qb.getMany();
  }

  async page(
    filter: FilterDto & { pageNum?: number; pageSize?: number }
  ): Promise<{ list: Entity[]; total: number; pageNum: number; pageSize: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      list: entities,
      total,
      pageNum,
      pageSize,
    };
  }
}
