import { IsNotEmpty, IsArray, IsString, IsBoolean } from "class-validator";

export class OperationByIdListDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  includeIds: string[];
}

export class OperationByIdListResultDto {
  @IsNotEmpty()
  @IsBoolean()
  result: boolean;
}
