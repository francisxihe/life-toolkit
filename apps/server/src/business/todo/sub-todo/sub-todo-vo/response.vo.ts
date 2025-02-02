import { ApiProperty } from "@nestjs/swagger";
import { ResponseVO } from "@/base/vo/response.vo";
import { SubTodoVO } from "./sub-todo.vo";
import {
  OperationResultVO,
} from "@/base/vo/operation-result.vo";

export class SubTodoResponseVO extends ResponseVO<SubTodoVO> {
  @ApiProperty({
    type: SubTodoVO,
  })
  data: SubTodoVO;
}

export class SubTodoListResponseVO extends ResponseVO<SubTodoVO[]> {
  @ApiProperty({
    type: [SubTodoVO],
  })
  data: SubTodoVO[];
}

export class SubTodoOperationResponseVO extends ResponseVO<OperationResultVO> {
  @ApiProperty({
    type: OperationResultVO,
  })
  data: OperationResultVO;
}
