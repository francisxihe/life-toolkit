import { ApiProperty } from "@nestjs/swagger";

export class BatchOperationResultVO {
  @ApiProperty({
    description: "操作ID",
    example: "1234567890",
  })
  id: string;

  @ApiProperty({
    description: "操作结果",
    example: true,
  })
  result: boolean;
}

export class OperationResultVO {
  @ApiProperty({
    description: "操作结果",
    example: true,
  })
  result: boolean;
}