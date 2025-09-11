import { TodoVo } from '@life-toolkit/vo';

export type TodoFormData = {
  name: string;
  description?: string;
  status?: TodoVo['status'];
  tags?: string[];
  importance?: number;
  urgency?: number;
  planDate: string;
  planTimeRange?: [string, string];
  repeatConfig?: TodoVo['repeatConfig'];
  source?: TodoVo['source'];
  repeatId?: string;
  taskId?: string;
  habitId?: string;
};
