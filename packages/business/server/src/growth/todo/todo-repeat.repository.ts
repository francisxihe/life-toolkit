import { FindOptionsWhere, UpdateResult } from "typeorm";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
} from "./dto";

export interface TodoRepeatRepository {
  create(createTodoRepeatDto: CreateTodoRepeatDto): Promise<TodoRepeatDto>;
  findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeatDto[]>;
  page(filter: TodoRepeatPageFiltersDto): Promise<{
    list: TodoRepeatDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(
    id: string,
    updateTodoRepeatDto: UpdateTodoRepeatDto
  ): Promise<TodoRepeatDto>;
  batchUpdate(
    idList: string[],
    updateTodoRepeatDto: UpdateTodoRepeatDto
  ): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoRepeatPageFiltersDto): Promise<void>;
  softDelete(id: string): Promise<void>;
  batchSoftDelete(idList: string[]): Promise<void>;
  findById(id: string, relations?: string[]): Promise<TodoRepeatDto>;
  findOneBy(condition: any): Promise<TodoRepeatDto | null>;
}
