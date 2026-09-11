export enum AiSuggestionKind {
  GOAL = 'goal',
  TASK = 'task',
  TODO = 'todo',
  HABIT = 'habit',
}

export const GoalDecomposeKey = 'goal.decompose' as const;
export const TaskDecomposeKey = 'task.decompose' as const;
