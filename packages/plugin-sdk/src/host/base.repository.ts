import { UpdateResult, DeleteResult } from 'typeorm';
import { PageFilterDto } from './page.dto.ts';

export interface BaseRepository<Entity, FilterDto> {
  create(entity: Entity): Promise<Entity>;
  update(entityUpdate: Entity): Promise<Entity>;
  updateByFilter(filter: FilterDto, entityUpdate: Entity): Promise<UpdateResult>;
  delete(id: string): Promise<DeleteResult>;
  deleteByFilter(filter: FilterDto): Promise<DeleteResult>;
  softDelete(id: string): Promise<DeleteResult>;
  softDeleteByFilter(filter: FilterDto): Promise<DeleteResult>;
  find(id: string): Promise<Entity>;
  findWithRelations(id: string, relations?: string[]): Promise<Entity>;
  findByFilter(filter: FilterDto): Promise<Entity[]>;
  page(filter: FilterDto & PageFilterDto): Promise<{
    list: Entity[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
}
