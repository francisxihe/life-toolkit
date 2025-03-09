import { Entity, Column } from "typeorm";
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

export enum HabitStatus {
  ACTIVE = "active",      // 活跃中
  PAUSED = "paused",      // 暂停
  COMPLETED = "completed", // 已完成
  ABANDONED = "abandoned", // 已放弃
}

export enum HabitFrequency {
  DAILY = "daily",        // 每天
  WEEKLY = "weekly",      // 每周
  MONTHLY = "monthly",    // 每月
  CUSTOM = "custom",      // 自定义
}

export enum HabitDifficulty {
  EASY = "easy",          // 容易
  MEDIUM = "medium",      // 中等
  HARD = "hard",          // 困难
}

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
  @Column("simple-array", { default: [] })
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  /** 习惯频率 */
  @Column({
    type: "enum",
    enum: HabitFrequency,
    default: HabitFrequency.DAILY,
  })
  @IsEnum(HabitFrequency)
  frequency: HabitFrequency = HabitFrequency.DAILY;

  /** 习惯频率自定义值 (如"每2天") */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  customFrequency?: string;

  /** 习惯难度 */
  @Column({
    type: "enum",
    enum: HabitDifficulty,
    default: HabitDifficulty.MEDIUM,
  })
  @IsEnum(HabitDifficulty)
  difficulty: HabitDifficulty = HabitDifficulty.MEDIUM;

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

  /** 是否需要提醒 */
  @Column({ default: false })
  @IsBoolean()
  needReminder: boolean = false;

  /** 提醒时间 (HH:MM 格式) */
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  reminderTime?: string;
  
  /** 累计完成次数 */
  @Column({ default: 0 })
  @IsNumber()
  @Type(() => Number)
  completedCount: number = 0;
} 