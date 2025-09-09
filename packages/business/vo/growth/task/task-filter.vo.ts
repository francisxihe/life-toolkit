import { TaskVo } from './task-model.vo';
import { BaseFilterVo } from '../../common';

export type TaskFilterVo = {
  startDateStart?: string;
  startDateEnd?: string;
  endDateStart?: string;
  endDateEnd?: string;
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  goalIds?: string[];
  id?: string;
} & BaseFilterVo &
  Partial<Pick<TaskVo, 'importance' | 'urgency' | 'status'>>;

export type TaskPageFilterVo = TaskFilterVo & {
  pageNum: number;
  pageSize: number;
};
