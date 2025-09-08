import { BaseModelVo } from '../../common/model.vo';

export type TodoRepeatWithoutRelationsVo = {
} & BaseModelVo;

export type TodoRepeatListVo = {
  list: TodoRepeatWithoutRelationsVo[];
};

export type TodoRepeatPageVo = {
  list: TodoRepeatWithoutRelationsVo[];
  total: number;
  pageNum: number;
  pageSize: number;
};
