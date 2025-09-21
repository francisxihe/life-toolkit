import { GoalVo } from './goal-model.vo';
import { BaseFilterVo } from '../../common';

export type GoalFilterVo = {
  startDateStart?: string;
  startDateEnd?: string;
  endDateStart?: string;
  endDateEnd?: string;
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  id?: string;
  parentId?: string;
} & BaseFilterVo &
  Partial<Pick<GoalVo, 'type' | 'importance' | 'status'>>;

export type GoalPageFilterVo = GoalFilterVo & {
  pageNum: number;
  pageSize: number;
};
