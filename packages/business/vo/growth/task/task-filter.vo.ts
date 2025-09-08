import { TaskVo, TaskWithoutRelationsVo } from './task-model.vo';
import { BaseFilterVo } from '../../common';

export type TaskPageVo = {
  list: TaskWithoutRelationsVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TaskListVo = {
  list: TaskWithoutRelationsVo[];
};

export type TaskFilterVo = BaseFilterVo &
  Partial<
    Pick<TaskVo, 'startAt' | 'endAt' | 'importance' | 'urgency' | 'status'> & {
      parentId?: TaskVo['parentId'];
      doneDateStart?: TaskVo['doneAt'];
      doneDateEnd?: TaskVo['doneAt'];
      abandonedDateStart?: TaskVo['abandonedAt'];
      abandonedDateEnd?: TaskVo['abandonedAt'];
      startDateStart?: TaskVo['startAt'];
      startDateEnd?: TaskVo['startAt'];
      endDateStart?: TaskVo['endAt'];
      endDateEnd?: TaskVo['endAt'];
    }
  >;

export type TaskPageFilterVo = TaskFilterVo & {
  tags?: string[];
  pageNum?: number;
  pageSize?: number;
};
