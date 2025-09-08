import { BaseFilterVo } from '../../common/model.vo';

export type TodoRepeatListFilterVo = {
  currentDateStart?: string;
  currentDateEnd?: string;
  abandonedDateStart?: string;
  abandonedDateEnd?: string;
} & BaseFilterVo;

export type TodoRepeatPagesFilterVo = {
} & BaseFilterVo;
