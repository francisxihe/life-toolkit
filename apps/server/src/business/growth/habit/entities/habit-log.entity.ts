import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { IsString, IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { BaseEntity } from "@/base/base.entity";
import { Habit } from "./habit.entity";

@Entity("habit_log")
export class HabitLog extends BaseEntity {
  /** 关联的习惯 */
  @ManyToOne(() => Habit, { onDelete: "CASCADE" })
  @JoinColumn({ name: "habitId" })
  habit: Habit;

  /** 习惯ID */
  @Column()
  @IsString()
  habitId: string;

  /** 记录日期 (YYYY-MM-DD) */
  @Column("date")
  logDate: Date;

  /** 完成情况评分 (0-未完成, 1-部分完成, 2-完全完成) */
  @Column({ default: 2 })
  @IsNumber()
  @Type(() => Number)
  completionScore: number = 2;

  /** 笔记 */
  @Column({ type: "text", nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  /** 情绪/感受 (1-5, 5最佳) */
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  mood?: number;
} 