export * from "./goal-model.vo";
import { GoalVo, GoalItemVo } from "./goal-model.vo";

export type GoalListFiltersVo = Partial<
  Pick<GoalVo, "startAt" | "endAt" | "importance" | "urgency" | "status"> & {
    keyword?: string;
    doneDateStart?: string;
    doneDateEnd?: string;
    abandonedDateStart?: string;
    abandonedDateEnd?: string;
  }
>;

export type GoalPageFiltersVo = Partial<
  Pick<
    GoalVo,
    "startAt" | "endAt" | "importance" | "urgency" | "status" | "type"
  > & {
    keyword?: string;
    doneDateStart?: string;
    doneDateEnd?: string;
    abandonedDateStart?: string;
    abandonedDateEnd?: string;
  }
>;

export type GoalListVo = {
  list: GoalItemVo[];
};

export type GoalPageVo = {
  list: GoalItemVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
