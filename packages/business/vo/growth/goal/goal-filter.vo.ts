export * from "./goal-model.vo";
import { GoalVo, GoalItemVo } from "./goal-model.vo";

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
  list: GoalItemVo[];
};

export type GoalPageVo = {
  list: GoalItemVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
