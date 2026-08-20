export enum TodoStatus {
  TODO = 'todo',
  DONE = 'done',
  ABANDONED = 'abandoned',
}

export enum TodoRelatedType {
  /** 独立待办 */
  NONE = 'none',
  /** 目标来源 */
  GOAL = 'goal',
  /** 习惯创建 */
  HABIT = 'habit',
  /** 任务创建 */
  TASK = 'task',
  /** 重复模板的历史完成记录。仅内部使用。 */
  REPEAT = 'repeat',
  /** 重复 */
  IS_REPEAT = 'is-repeat',
}
