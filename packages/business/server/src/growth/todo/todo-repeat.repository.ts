import { TodoRepeat } from './todo-repeat.entity';
import { TodoRepeatFilterDto } from './dto';
import { BaseRepository } from '@business/common';

export interface TodoRepeatRepository extends BaseRepository<TodoRepeat, TodoRepeatFilterDto> {}
