import { BaseEntityVo } from '../../common';

export type TrackTimeWithoutRelationsVo = {
  startAt?: string;
  endAt?: string;
  duration?: number;
  notes?: string;
} & BaseEntityVo;

export type TrackTimeVo = TrackTimeWithoutRelationsVo;
