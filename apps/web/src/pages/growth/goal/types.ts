import { GoalVo } from '@life-toolkit/vo/growth';


export type GoalFormData = Pick<
  GoalVo,
  'name' | 'status' | 'importance' | 'urgency' | 'type' | 'description'
> & {
  id?: string;
  planTimeRange: [string | undefined, string | undefined];
  children: GoalFormData[];
  parentId?: string;
};
