import { IsString, IsOptional, IsNumber, IsDate, IsISO8601, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHabitLogDto {
  @IsString()
  habitId: string;

  @IsISO8601()
  logDate: Date;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  completionScore?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  mood?: number;
}

export class UpdateHabitLogDto {
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  completionScore?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  mood?: number;
} 