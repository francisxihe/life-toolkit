import { BaseEntityVo } from '../../common';
import { TaskVo } from '../task/task-model.vo';
import { GoalType, GoalStatus, Importance, Difficulty } from '@life-toolkit/enum';

export type GoalWithoutRelationsVo = {
  name: string;
  type: GoalType;
  status: GoalStatus;
  importance: Importance;
  difficulty?: Difficulty;
  startAt?: string;
  endAt?: string;
  description?: string;
  doneAt?: string;
  abandonedAt?: string;
  parentId?: string;
} & BaseEntityVo;

export type GoalVo = GoalWithoutRelationsVo & {
  children?: GoalVo[];
  parent?: GoalVo;
  taskList?: TaskVo[];
};
