import { TodoVo } from '@true-north/vo';

export type TodoFormData = {
  name: string;
  description?: string;
  status?: TodoVo['status'];
  importance?: number;
  urgency?: number;
  planDate: string;
  planTimeRange?: [string, string];
  repeatConfig?: TodoVo['repeatConfig'];
  relatedType?: TodoVo['relatedType'];
  relatedId?: string;
  repeatId?: string;
  taskId?: string;
  habitId?: string;
  /** 周期模板已结算次数；>0 时改重复规则不重置当前计划日期 */
  settledTimes?: number;
};
