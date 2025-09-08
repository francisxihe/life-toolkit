import { BaseModelVo } from '../../common/model.vo';

export type TodoRepeatModelVo = {
  todos?: Todo[];
  repeat: {;
  id: string;
  createdAt?: string;
  updatedAt?: string;
} & BaseModelVo;

export type TodoRepeatListVo = {
  list: TodoRepeatModelVo[];
};

export type TodoRepeatPageVo = {
  list: TodoRepeatModelVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
