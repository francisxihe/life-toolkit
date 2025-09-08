import { GoalVo } from '@life-toolkit/vo';

export type GoalFormData = Pick<
  GoalVo,
  'name' | 'status' | 'importance' | 'type' | 'description' | 'difficulty'
> & {
  id?: string;
  planTimeRange: [string | undefined, string | undefined];
  children?: GoalFormData[];
  parentId?: string;
};
