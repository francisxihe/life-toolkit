import "reflect-metadata";
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { BaseEntity } from "../../base.entity";
import { Goal } from "../goal/goal.entity";
import { Todo } from "../todo/todo.entity";
import { HabitStatus, HabitDifficulty } from "@life-toolkit/enum";

@Entity("habit")
export class Habit extends BaseEntity {
  /** 习惯名称 */
  @Column("varchar", { length: 255 })
  name: string;

  /** 习惯状态 */
  @Column({
    type: "simple-enum",
    enum: HabitStatus,
    default: HabitStatus.ACTIVE,
  })
  status: HabitStatus;

  /** 习惯描述 */
  @Column("text", { nullable: true })
  description?: string;

  /** 习惯重要程度 (1-5) */
  @Column("int", { default: 3 })
  importance?: number = 3;

  /** 习惯标签 */
  @Column("simple-array", { nullable: true })
  tags: string[];

  /** 习惯难度 */
  @Column({
    type: "simple-enum",
    enum: HabitDifficulty,
    default: HabitDifficulty.Skilled,
  })
  difficulty: HabitDifficulty = HabitDifficulty.Skilled;

  /** 习惯开始日期 */
  @Column("date")
  startDate: Date = new Date();

  /** 习惯目标日期（可选，如果设置了，则表示到此日期为止完成习惯） */
  @Column("date", { nullable: true })
  targetDate?: Date;

  /** 当前连续天数 */
  @Column("int", { default: 0 })
  currentStreak: number = 0;

  /** 最长连续天数 */
  @Column("int", { default: 0 })
  longestStreak: number = 0;

  /** 累计完成次数 */
  @Column("int", { default: 0 })
  completedCount: number = 0;

  /** 关联的目标 */
  @ManyToMany(() => Goal, { cascade: true })
  @JoinTable({
    name: "habit_goal",
    joinColumn: { name: "habit_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "goal_id", referencedColumnName: "id" },
  })
  goals: Goal[];

  /** 关联的待办事项（习惯产生的具体待办任务） */
  @OneToMany(() => Todo, (todo) => todo.habit, { cascade: true })
  todos: Todo[];
}
