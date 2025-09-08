import { TodoWithoutRelationsVo } from './todo-model.vo';
import { CreateRepeatVo, UpdateRepeatVo } from '@life-toolkit/components-repeat/vo';

export type CreateTodoVo = Pick<
  TodoWithoutRelationsVo,
  'name' | 'description' | 'status' | 'planDate' | 'planStartAt' | 'planEndAt' | 'importance' | 'urgency' | 'tags'
> & {
  taskId?: string;
  /** 关联的重复配置ID，优先于嵌套的 repeat */
  repeatId?: string;
  repeat?: CreateRepeatVo;
};

export type UpdateTodoVo = Partial<CreateTodoVo> & {
  repeat?: UpdateRepeatVo;
};
