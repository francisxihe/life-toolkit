export * from "./task-model.vo";
import { TaskVo, TaskModelVo } from "./task-model.vo";

export type TaskPageVo = {
  list: TaskModelVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type TaskListVo = {
  list: TaskModelVo[];
};

export type TaskListFiltersVo = Partial<
  Pick<TaskVo, "startAt" | "endAt" | "importance" | "urgency" | "status"> & {
    keyword?: string;
    parentId?: TaskVo["parentId"];
    doneDateStart?: TaskVo["doneAt"];
    doneDateEnd?: TaskVo["doneAt"];
    abandonedDateStart?: TaskVo["abandonedAt"];
    abandonedDateEnd?: TaskVo["abandonedAt"];
    startDateStart?: TaskVo["startAt"];
    startDateEnd?: TaskVo["startAt"];
    endDateStart?: TaskVo["endAt"];
    endDateEnd?: TaskVo["endAt"];
    excludeIds?: string[];
  }
>;

export type TaskPageFiltersVo = TaskListFiltersVo & {
  tags?: string[];
  pageNum?: number;
  pageSize?: number;
};
