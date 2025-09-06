import { BaseModelVo } from '../../common/model.vo';

export type TrackTimeModelVo = {
  startAt?: string;
  endAt?: string;
  duration?: number;
  notes?: string;
} & BaseModelVo;

export type TrackTimeVo = TrackTimeModelVo;
