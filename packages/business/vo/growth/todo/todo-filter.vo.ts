import { TodoVo, TodoWithoutRelationsVo } from './todo-model.vo';
import { BaseFilterVo } from '../../common';
import { TodoSource } from '@life-toolkit/enum';

export type TodoFilterVo = {
  planDateStart?: string;
  planDateEnd?: string;
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  taskIds?: string[];
  todoWithRepeatList?: { id: string; source: TodoSource }[];
} & BaseFilterVo &
  Partial<Pick<TodoVo, 'importance' | 'urgency' | 'status' | 'taskId'>>;

export type TodoPageFilterVo = TodoFilterVo & {
  pageNum: number;
  pageSize: number;
};
