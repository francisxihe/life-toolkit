import { GoalVo, GoalModelVo } from "./goal-model.vo";
import { BaseFilterVo } from "../../common";

export type GoalFilterVo = BaseFilterVo & Partial<
  Pick<GoalVo, "startAt" | "endAt" | "importance" | "status" | "type"> & {
    doneDateStart?: GoalVo["doneAt"];
    doneDateEnd?: GoalVo["doneAt"];
    abandonedDateStart?: GoalVo["abandonedAt"];
    abandonedDateEnd?: GoalVo["abandonedAt"];
    parentId?: GoalVo["id"];
  }
>;

export type GoalPageFilterVo = GoalFilterVo & {
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
