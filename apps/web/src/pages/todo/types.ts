import { Todo, GetTodoListParams } from './service/types';

export type TodoFormData = {
  name: string;
  description?: string;
  status?: Todo['status'];
  tags?: string[];
  importance?: number;
  urgency?: number;
  planDate: string;
  planTimeRange?: [string, string];
  recurring?: Todo['recurring'];
  subTodoList: SubTodoFormData[];
};

export type SubTodoFormData = {
  name: string;
  description?: string;
  status?: Todo['status'];
  tags?: string[];
  importance?: number;
  urgency?: number;
  planTimeRange?: [string, string];
  subTodoList: SubTodoFormData[];
};

export interface TodoFilters {
  keyword: string;
  importance: GetTodoListParams['importance'];
  urgency: GetTodoListParams['urgency'];
  planDateStart?: string;
  planDateEnd?: string;
  status?: Todo['status'];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  tags?: string[];
}
