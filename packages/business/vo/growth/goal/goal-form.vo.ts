import { GoalModelVo } from "./goal-model.vo";

export type CreateGoalVo = Omit<
  GoalModelVo,
  "doneAt" | "abandonedAt" | "status" | "children"
> & {
  parentId?: string;
};

export type UpdateGoalVo = Partial<CreateGoalVo>;
