import { BaseModelVo } from '../../common/model.vo';
import { TaskVo } from '../task/task-model.vo';
import { RepeatVo } from '@life-toolkit/components-repeat/vo';
import { TodoStatus, TodoSource } from '@life-toolkit/enum';

export type TodoModelVo = {
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
} & BaseModelVo;

export type TodoVo = TodoModelVo & {
  /** 关联的任务 */
  task?: TaskVo;
};
