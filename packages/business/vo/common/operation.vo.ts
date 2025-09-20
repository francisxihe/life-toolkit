export interface OperationBatchResultVo {
  list?: {
    id: string;
    result: 'success' | 'failed';
    message?: string;
  }[];
  result: 'success' | 'failed';
  message?: string;
}
