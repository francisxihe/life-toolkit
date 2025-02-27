export * from "./goal.vo";
import { GoalModelVo, GoalVo, GoalItemVo } from "./goal.vo";

export type CreateGoalVo = Omit<
  GoalModelVo,
  "doneAt" | "abandonedAt" | "status"
> & {
  parentId?: string;
};

export type UpdateGoalVo = Partial<CreateGoalVo>;

export type GoalListVo = {
  list: GoalItemVo[];
};

export type GoalPageVo = {
  list: GoalItemVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};

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
