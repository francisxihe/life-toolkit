import { GoalWithoutRelationsVo } from "./goal-model.vo";

export type CreateGoalVo = Omit<
  GoalWithoutRelationsVo,
  "doneAt" | "abandonedAt" | "status" | "children"
> & {
  parentId?: string;
};

export type UpdateGoalVo = Partial<CreateGoalVo>;
