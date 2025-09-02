import { FindOptionsWhere, UpdateResult } from "typeorm";
import { TodoRepeat } from "./todo-repeat.entity";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  TodoRepeatPageFiltersDto,
  TodoRepeatListFilterDto,
  TodoRepeatDto,
} from "./dto";

export interface TodoRepeatRepository {
  create(todoRepeat: Partial<TodoRepeat>): Promise<TodoRepeat>;
  findAll(filter: TodoRepeatListFilterDto): Promise<TodoRepeat[]>;
  page(filter: TodoRepeatPageFiltersDto): Promise<{
    list: TodoRepeat[];
    total: number;
    pageNum: number;
    pageSize: number;
  }>;
  update(
    id: string,
    todoRepeatUpdate: Partial<TodoRepeat>
  ): Promise<TodoRepeat>;
  batchUpdate(
    includeIds: string[],
    todoRepeatUpdate: Partial<TodoRepeat>
  ): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
  deleteByFilter(filter: TodoRepeatPageFiltersDto): Promise<void>;
  softDelete(id: string): Promise<void>;
  batchSoftDelete(includeIds: string[]): Promise<void>;
  findById(id: string, relations?: string[]): Promise<TodoRepeat>;
  findAllByTaskIds(taskIds: string[]): Promise<TodoRepeat[]>;
  softDeleteByTaskIds(taskIds: string[]): Promise<void>;
  findOneBy(condition: any): Promise<TodoRepeat | null>;
}
