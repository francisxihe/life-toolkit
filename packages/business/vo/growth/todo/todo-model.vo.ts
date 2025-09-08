import { BaseEntityVo } from '../../common';
import { TaskVo } from '../task/task-model.vo';
import { RepeatVo } from '@life-toolkit/components-repeat/vo';
import { TodoStatus, TodoSource } from '@life-toolkit/enum';

export type TodoWithoutRelationsVo = {
  name: string;
  status: TodoStatus;
  planDate: string;
  description?: string;
  tags?: string[];
  importance?: number;
  urgency?: number;
  planStartAt?: string;
  planEndAt?: string;
  repeat?: RepeatVo;
  doneAt?: string;
  abandonedAt?: string;
  source?: TodoSource;
} & BaseEntityVo;

export type TodoVo = TodoWithoutRelationsVo & {
  /** 关联的任务 */
  task?: TaskVo;
};
