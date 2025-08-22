import { TodoVo } from '@life-toolkit/vo/growth';

export type TodoFormData = {
  name: string;
  description?: string;
  status?: TodoVo['status'];
  tags?: string[];
  importance?: number;
  urgency?: number;
  planDate: string;
  planTimeRange?: [string, string];
  repeat?: TodoVo['repeat'];
  taskId?: string;
};
