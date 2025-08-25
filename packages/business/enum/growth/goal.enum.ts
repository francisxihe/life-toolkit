import { Importance, Difficulty } from "../base";

export enum GoalType {
  OBJECTIVE = "objective",
  KEY_RESULT = "key_result",
}

export enum GoalStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  ABANDONED = "abandoned",
}

export enum GoalImportance {
  Supplementary = Importance.Supplementary,
  Helpful = Importance.Helpful,
  Core = Importance.Core,
  Key = Importance.Key,
  Essential = Importance.Essential,
}

export enum GoalDifficulty {
  GettingStarted = Difficulty.GettingStarted,
  Skilled = Difficulty.Skilled,
  Challenger = Difficulty.Challenger,
  Master = Difficulty.Master,
  Legendary = Difficulty.Legendary,
}
