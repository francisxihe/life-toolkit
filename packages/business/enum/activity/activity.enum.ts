export enum ActivitySource {
  HOME = 'home',
  DOMAIN = 'domain',
  WORKBENCH = 'workbench',
  AI = 'ai',
}

export enum ActivityDomain {
  TODO = 'todo',
  EXPENSE = 'expense',
  PURCHASE = 'purchase',
  BOOKMARK = 'bookmark',
  HABIT = 'habit',
  FOCUS = 'focus',
  TASK = 'task',
  GOAL = 'goal',
}

export const ActivityCaptureKey = 'activity.capture' as const;

export enum ActivityLinkRole {
  PRIMARY = 'primary',
  EXPENSE = 'expense',
  PURCHASE = 'purchase',
  BOOKMARK = 'bookmark',
  TODO = 'todo',
  HABIT = 'habit',
  FOCUS = 'focus',
}
