export enum TodoStatus {
  TODO = "todo",
  DONE = "done",
  ABANDONED = "abandoned",
}

export enum TodoSource {
  /** 手动创建 */
  MANUAL = "manual",
  /** 重复创建 */
  REPEAT = "repeat",
  /** 习惯创建 */
  HABIT = "habit",
}
