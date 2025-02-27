export * from "./goal.vo";
import { GoalModelVo, GoalVo } from "./goal.vo";

export type CreateGoalVo = Omit<
  GoalModelVo,
  "doneAt" | "abandonedAt" | "status"
> & {
  parentId?: string;
};

export type UpdateGoalVo = Partial<CreateGoalVo>;

export type GoalListVo = {
  list: GoalModelVo[];
};

export type GoalPageVo = {
  list: GoalModelVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type GoalListFiltersVo = {
  keyword?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: GoalVo["importance"];
  urgency?: GoalVo["urgency"];
  status?: GoalVo["status"];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
};

export type GoalPageFiltersVo = {
  keyword?: string;
  planDateStart?: string;
  planDateEnd?: string;
  importance?: GoalVo["importance"];
  urgency?: GoalVo["urgency"];
  status?: GoalVo["status"];
  doneDateStart?: string;
  doneDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
  tags?: string[];
};
