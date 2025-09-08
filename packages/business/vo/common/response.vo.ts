export interface ResponseVo<T> {
  code: number;
  message: string;
}

export type ResponsePageVo<T> = {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
};

export type ResponseListVo<T> = {
  list: T[];
};

export type ResponseTreeVo<T extends { children?: T[] }> = T[];
