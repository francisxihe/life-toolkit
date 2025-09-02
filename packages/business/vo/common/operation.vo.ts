export interface BatchOperationResultVo {
  id: string;
  result: boolean;
}

export interface OperationResultVo {
  result: boolean;
}

export type OperationByIdListVo = {
  includeIds: string[];
};
