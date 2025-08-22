import { HabitDifficulty, HabitStatus } from "./habit.enum";
import { BaseEntity } from "../../base/base.entity";
import { Goal } from "../goal";
import { Todo } from "../todo";

export class Habit extends BaseEntity {
  /** 习惯名称 */
  name!: string;

  /** 习惯状态 */
  status!: HabitStatus;

  /** 习惯描述 */
  description?: string;

  importance?: number = 3;

  tags!: string[];

  /** 习惯难度 */
  difficulty: HabitDifficulty = HabitDifficulty.MEDIUM;

  /** 习惯开始日期 */
  startDate: Date = new Date();

  /** 习惯目标日期（可选，如果设置了，则表示到此日期为止完成习惯） */
  targetDate?: Date;

  /** 当前连续天数 */
  currentStreak: number = 0;

  /** 最长连续天数 */
  longestStreak: number = 0;

  /** 累计完成次数 */
  completedCount: number = 0;

  /** 关联的目标 */
  goals!: Goal[];

  /** 关联的待办事项（习惯产生的具体待办任务） */
  todos!: Todo[];
}
