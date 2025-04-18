export * from "./task-model.vo";
import { TaskVo, TaskItemVo } from "./task-model.vo";
import { self } from "../../base";

export type TaskPageVo = {
  list: TaskItemVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TaskListVo = {
  list: TaskItemVo[];
};

export type TaskListFiltersVo = Partial<
  Pick<TaskVo, "startAt" | "endAt" | "importance" | "urgency" | "status"> & {
    keyword?: string;
    parentId?: TaskVo["parentId"];
    doneDateStart?: TaskVo["doneAt"];
    doneDateEnd?: TaskVo["doneAt"];
    abandonedDateStart?: TaskVo["abandonedAt"];
    abandonedDateEnd?: TaskVo["abandonedAt"];
  } & self
>;

export type TaskPageFiltersVo = TaskListFiltersVo & {
  tags?: string[];
  pageNum?: number;
  pageSize?: number;
};
