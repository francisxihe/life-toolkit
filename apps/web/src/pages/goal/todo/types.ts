import { TodoVo } from '@life-toolkit/vo/todo';

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
};

export type SubTodoFormData = {
  name: string;
  description?: string;
  status?: TodoVo['status'];
  tags?: string[];
  importance?: number;
  urgency?: number;
  planTimeRange?: [string, string];
};
