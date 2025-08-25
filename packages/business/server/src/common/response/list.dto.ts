import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class ListResponseDto<T> {
  @IsNumber()
  @Type(() => Number)
  total!: number;

  list!: T[];

  constructor({ list, total }: { list: T[]; total: number }) {
    this.total = total;
    this.list = list;
  }
}
