export * from "./goal.vo";
import { GoalModelVo, GoalVo } from "./goal.vo";
import { TrackTimeVo } from "../../track-time";

export type GoalWithTrackTimeVo = GoalVo & {
  trackTimeList: TrackTimeVo[];
};

export type GoalPageVo = {
  list: GoalVo[];

  total: number;

  pageNum: number;

  pageSize: number;
};

export type CreateGoalVo = Omit<
  GoalModelVo,
  "doneAt" | "abandonedAt" | "status"
>;

export type UpdateGoalVo = Partial<CreateGoalVo>;

export type GoalListVo = {
  list: GoalVo[];
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
