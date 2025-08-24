import { Entity, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsISO8601,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseEntity } from "@/base/base.entity";
import { Goal } from "../../goal/entities";
import { Todo } from "../../todo/entities";
import { HabitStatus, HabitDifficulty } from "@life-toolkit/enum";

@Entity("habit")
export class Habit extends BaseEntity {
  /** 习惯名称 */
  @Column()
  @IsString()
  name: string;

  /** 习惯状态 */
  @Column({
    type: "enum",
    enum: HabitStatus,
    default: HabitStatus.ACTIVE,
  })
  @IsEnum(HabitStatus)
  status: HabitStatus;

  /** 习惯描述 */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  /** 习惯重要程度 (1-5) */
  @Column({ default: 3 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  importance?: number = 3;

  /** 习惯标签 */
  @Column("simple-array", {
    nullable: true,
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  /** 习惯难度 */
  @Column({
    type: "enum",
    enum: HabitDifficulty,
    default: HabitDifficulty.Challenger,
  })
  @IsEnum(HabitDifficulty)
  difficulty: HabitDifficulty = HabitDifficulty.Challenger;

  /** 习惯开始日期 */
  @Column("date")
  @IsISO8601()
  startDate: Date = new Date();

  /** 习惯目标日期（可选，如果设置了，则表示到此日期为止完成习惯） */
  @Column("date", { nullable: true })
  @IsISO8601()
  @IsOptional()
  targetDate?: Date;

  /** 当前连续天数 */
  @Column({ default: 0 })
  @IsNumber()
  @Type(() => Number)
  currentStreak: number = 0;

  /** 最长连续天数 */
  @Column({ default: 0 })
  @IsNumber()
  @Type(() => Number)
  longestStreak: number = 0;

  /** 累计完成次数 */
  @Column({ default: 0 })
  @IsNumber()
  @Type(() => Number)
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
