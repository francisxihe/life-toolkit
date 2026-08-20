import { GoalVo } from '@true-north/vo';
import { Dayjs } from 'dayjs';

export type GoalFormData = Pick<GoalVo, 'name' | 'status' | 'importance' | 'type' | 'description' | 'difficulty'> & {
  id?: string;
  planTimeRange: [Dayjs | string | undefined, Dayjs | string | undefined];
  children?: GoalFormData[];
  parentId?: string;
};
