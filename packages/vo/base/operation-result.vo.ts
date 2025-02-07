import { ApiProperty } from "@nestjs/swagger";

export interface BatchOperationResultVO {
  id: string;

  result: boolean;
}

export interface OperationResultVO {
  result: boolean;
}