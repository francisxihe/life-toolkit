import { IsOptional, IsNumber } from "class-validator";

export class PageDto {
  @IsOptional()
  @IsNumber()
  pageNum?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
