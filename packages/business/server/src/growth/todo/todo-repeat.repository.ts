import { TodoRepeat } from './todo-repeat.entity';
import { TodoRepeatListFilterDto } from './dto';
import { BaseRepository } from '@business/common';

export interface TodoRepeatRepository extends BaseRepository<TodoRepeat, TodoRepeatListFilterDto> {}
