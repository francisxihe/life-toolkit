export * from "./goal-model.vo";
import { GoalVo, GoalModelVo } from "./goal-model.vo";

export type GoalListFiltersVo = Partial<
  Pick<GoalVo, "startAt" | "endAt" | "importance" | "status" | "type"> & {
    keyword?: string;
    doneDateStart?: GoalVo["doneAt"];
    doneDateEnd?: GoalVo["doneAt"];
    abandonedDateStart?: GoalVo["abandonedAt"];
    abandonedDateEnd?: GoalVo["abandonedAt"];
    parentId?: GoalVo["id"];
    excludeIds?: string[];
  }
>;

export type GoalPageFiltersVo = GoalListFiltersVo & {
  pageNum?: number;
  pageSize?: number;
};

export type GoalListVo = {
  list: GoalModelVo[];
};

export type GoalPageVo = {
  list: GoalModelVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
