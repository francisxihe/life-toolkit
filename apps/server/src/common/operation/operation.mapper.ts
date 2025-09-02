import type { OperationByIdListVo } from "@life-toolkit/vo";
import { OperationByIdListDto } from "./operation.dto";

export class OperationMapper {
  static voToOperationByIdListDto(
    vo: OperationByIdListVo
  ): OperationByIdListDto {
    return { includeIds: vo.includeIds };
  }
}
