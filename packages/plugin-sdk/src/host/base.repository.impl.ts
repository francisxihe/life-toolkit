import { Repository, SelectQueryBuilder, DeleteResult, UpdateResult } from 'typeorm';
import { BaseEntity } from './base.entity.ts';

export class BaseRepositoryImpl<Entity extends BaseEntity, FilterDto> {
  repo!: Repository<Entity>;
  buildQuery!: (filter: FilterDto) => SelectQueryBuilder<Entity>;

  constructor(
    repo: Repository<Entity> | (() => Repository<Entity>),
    buildQuery: (filter: FilterDto) => SelectQueryBuilder<Entity>,
  ) {
    if (typeof repo === 'function') {
      Object.defineProperty(this, 'repo', {
        configurable: true,
        enumerable: true,
        get: repo,
      });
    } else {
      this.repo = repo;
    }
    this.buildQuery = buildQuery;
  }

  async create(entity: Entity): Promise<Entity> {
    const saved = await this.repo.save(entity);
    return this.find(saved.id);
  }

  async delete(id: Entity['id']): Promise<DeleteResult> {
    return await this.repo.delete(id);
  }

  async deleteByFilter(filter: FilterDto): Promise<DeleteResult> {
    const ids = await this.findIdsByFilter(filter);
    if (!ids.length) return { raw: [], affected: 0 };
    return await this.repo.delete(ids);
  }

  async softDelete(id: Entity['id']): Promise<DeleteResult> {
    return await this.repo.softDelete(id);
  }

  async softDeleteByFilter(filter: FilterDto): Promise<DeleteResult> {
    const ids = await this.findIdsByFilter(filter);
    if (!ids.length) return { raw: [], affected: 0 };
    return await this.repo.softDelete(ids);
  }

  async update(updateEntity: Entity): Promise<Entity> {
    const saved = await this.repo.save(updateEntity);
    return this.find(saved.id);
  }

  async updateByFilter(filter: FilterDto, updateEntity: Entity): Promise<UpdateResult> {
    const ids = await this.findIdsByFilter(filter);
    if (!ids.length) return { raw: [], generatedMaps: [], affected: 0 };
    return await this.repo
      .createQueryBuilder()
      .update()
      .set(updateEntity as never)
      .whereInIds(ids)
      .execute();
  }

  async find(id: Entity['id']): Promise<Entity> {
    const entity = await this.repo.findOne({ where: { id: id as never } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return entity;
  }

  async findWithRelations(id: Entity['id'], relations?: string[]): Promise<Entity> {
    const entity = await this.repo.findOne({ where: { id: id as never }, relations });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return entity;
  }

  async findByFilter(filter: FilterDto): Promise<Entity[]> {
    const qb = this.buildQuery(filter);
    return await qb.getMany();
  }

  private async findIdsByFilter(filter: FilterDto): Promise<Entity['id'][]> {
    const list = await this.findByFilter(filter);
    return list.map((item) => item.id);
  }

  async page(
    filter: FilterDto & { pageNum?: number; pageSize?: number },
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

export { BaseRepositoryImpl as BaseRepository };
