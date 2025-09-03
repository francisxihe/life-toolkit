import { UpdateResult } from "typeorm";
import { TodoRepeat } from "./todo-repeat.entity";
import {
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
} from "./dto";

export interface TodoRepeatRepository {
  create(todoRepeat: TodoRepeat): Promise<TodoRepeat>;
  findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeat[]>;
  page(filter: TodoRepeatPageFiltersDto): Promise<{
    list: TodoRepeat[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(todoRepeatUpdate: TodoRepeat): Promise<TodoRepeat>;
  updateByFilter(
    filter: any,
    todoRepeatUpdate: TodoRepeat  
  ): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoRepeatListFilterDto): Promise<void>;
  softDelete(id: string): Promise<void>;
  softDeleteByFilter(filter: TodoRepeatListFilterDto): Promise<void>;
  find(id: string): Promise<TodoRepeat>;
  findWithRelations(id: string, relations?: string[]): Promise<TodoRepeat>;
}
