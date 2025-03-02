import { GoalModelVo } from "./goal-model.vo";

export type CreateGoalVo = Omit<
  GoalModelVo,
  "doneAt" | "abandonedAt" | "status"
> & {
  parentId?: string;
};

export type UpdateGoalVo = Partial<CreateGoalVo>;
