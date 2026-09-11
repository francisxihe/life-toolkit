import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PageFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageNum?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;
}
