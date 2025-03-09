import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, IsISO8601, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { HabitStatus, HabitFrequency, HabitDifficulty } from '../entities';
import { PageDto } from "@/base/page.dto";

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  importance?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(HabitFrequency)
  @IsOptional()
  frequency?: HabitFrequency;

  @IsString()
  @IsOptional()
  customFrequency?: string;

  @IsEnum(HabitDifficulty)
  @IsOptional()
  difficulty?: HabitDifficulty;

  @IsISO8601()
  @IsOptional()
  startDate?: Date;

  @IsISO8601()
  @IsOptional()
  targetDate?: Date;

  @IsBoolean()
  @IsOptional()
  needReminder?: boolean;

  @IsString()
  @IsOptional()
  reminderTime?: string;
}

export class UpdateHabitDto extends CreateHabitDto {
  @IsEnum(HabitStatus)
  @IsOptional()
  status?: HabitStatus;

  @IsNumber()
  @IsOptional()
  currentStreak?: number;

  @IsNumber()
  @IsOptional()
  longestStreak?: number;

  @IsNumber()
  @IsOptional()
  completedCount?: number;
}

export class HabitFilterDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsEnum(HabitStatus, { each: true })
  @IsOptional()
  @IsArray()
  status?: HabitStatus[];

  @IsEnum(HabitFrequency, { each: true })
  @IsOptional()
  @IsArray()
  frequency?: HabitFrequency[];

  @IsEnum(HabitDifficulty, { each: true })
  @IsOptional()
  @IsArray()
  difficulty?: HabitDifficulty[];

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class HabitPageFilterDto extends PageDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsEnum(HabitStatus, { each: true })
  @IsOptional()
  @IsArray()
  status?: HabitStatus[];

  @IsEnum(HabitFrequency, { each: true })
  @IsOptional()
  @IsArray()
  frequency?: HabitFrequency[];

  @IsEnum(HabitDifficulty, { each: true })
  @IsOptional()
  @IsArray()
  difficulty?: HabitDifficulty[];

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
} 