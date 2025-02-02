import { ApiProperty } from "@nestjs/swagger";
import { Type } from "@nestjs/common";

export class ResponseVO<T> {
  @ApiProperty({
    description: "状态码",
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: "响应消息",
    example: "操作成功",
  })
  message: string;

  constructor(code = 200, message = "操作成功") {
    this.code = code;
    this.message = message;
  }
}