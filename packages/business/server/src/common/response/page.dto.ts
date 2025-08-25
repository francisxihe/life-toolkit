import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class PageResponseDto<T> {
  @IsNumber()
  @Type(() => Number)
  pageNum!: number;

  @IsNumber()
  @Type(() => Number)
  pageSize!: number;

  @IsNumber()
  @Type(() => Number)
  total!: number;

  list!: T[];

  constructor({
    list,
    total,
    pageNum,
    pageSize,
  }: {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  }) {
    this.list = list;
    this.total = total;
    this.pageNum = pageNum;
    this.pageSize = pageSize;
  }
}
