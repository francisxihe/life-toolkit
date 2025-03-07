export * from "./task-model.vo";
import { TaskVo } from "./task-model.vo";

export type TaskPageVo = {
  list: TaskVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TaskListVo = {
  list: TaskVo[];
};

export type TaskListFiltersVo = {
  keyword?: string;
  parentId?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: TaskVo["importance"];
  urgency?: TaskVo["urgency"];
  status?: TaskVo["status"];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
};

export type TaskPageFiltersVo = TaskListFiltersVo & {
  tags?: string[];
};
