import { ApiProperty } from "@nestjs/swagger";
import { ResponseVO } from "@/base/vo/response.vo";
import { TodoVO, TodoWithSubVO, TodoPageVO, TodoListVO } from "./index";
import {
  BatchOperationResultVO,
  OperationResultVO,
} from "@/base/vo/operation-result.vo";

export class TodoResponseVO extends ResponseVO<TodoVO> {
  @ApiProperty({
    type: TodoVO,
  })
  data: TodoVO;
}

export class TodoWithSubResponseVO extends ResponseVO<TodoWithSubVO> {
  @ApiProperty({
    type: TodoWithSubVO,
  })
  data: TodoWithSubVO;
}

export class TodoPageResponseVO extends ResponseVO<TodoPageVO> {
  @ApiProperty({
    type: TodoPageVO,
  })
  data: TodoPageVO;
}

export class TodoListResponseVO extends ResponseVO<TodoListVO> {
  @ApiProperty({
    type: TodoListVO,
  })
  data: TodoListVO;
}

export class TodoBatchOperationResponseVO extends ResponseVO<
  BatchOperationResultVO[]
> {
  @ApiProperty({
    type: [BatchOperationResultVO],
  })
  data: BatchOperationResultVO[];
}

export class TodoOperationResponseVO extends ResponseVO<OperationResultVO> {
  @ApiProperty({
    type: OperationResultVO,
  })
  data: OperationResultVO;
}
