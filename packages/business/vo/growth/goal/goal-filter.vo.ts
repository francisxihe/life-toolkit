import { GoalVo, GoalWithoutRelationsVo } from "./goal-model.vo";
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
  list: GoalWithoutRelationsVo[];
};

export type GoalPageVo = {
  list: GoalWithoutRelationsVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};

export type GoalTreeVo = GoalVo[];
