export * from "./task.vo";
import { TaskModelVo, TaskVo } from "./task.vo";
import { TrackTimeVo } from "../../track-time";

export type TaskWithTrackTimeVo = TaskVo & {
  trackTimeList: TrackTimeVo[];
};

export type TaskPageVo = {
  list: TaskVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type CreateTaskVo = Omit<
  TaskModelVo,
  "doneAt" | "abandonedAt" | "status"
>;

export type UpdateTaskVo = Partial<CreateTaskVo>;

export type TaskListVo = {
  list: TaskVo[];
};

export type TaskListFiltersVo = {
  keyword?: string;
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

export type TaskPageFiltersVo = {
  keyword?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: TaskVo["importance"];
  urgency?: TaskVo["urgency"];
  status?: TaskVo["status"];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  tags?: string[];
};
