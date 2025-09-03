import { Todo } from './todo.entity';
import { TodoFilterDto } from './dto';
import { BaseRepository } from '@business/common';

export interface TodoRepository extends BaseRepository<Todo, TodoFilterDto> {}
