import { BaseModelVo } from '../../common/model.vo';

export type CreateTodoRepeatModelVo = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
} & BaseModelVo;

export type UpdateTodoRepeatModelVo = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
} & BaseModelVo;

export type CreateTodoRepeatListVo = {
  list: CreateTodoRepeatModelVo[];
};

export type CreateTodoRepeatPageVo = {
  list: CreateTodoRepeatModelVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};

export type UpdateTodoRepeatListVo = {
  list: UpdateTodoRepeatModelVo[];
};

export type UpdateTodoRepeatPageVo = {
  list: UpdateTodoRepeatModelVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
