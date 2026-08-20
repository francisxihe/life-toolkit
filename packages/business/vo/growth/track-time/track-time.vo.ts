import { BaseEntityVo } from '../../common';
import { TrackTimeRelatedType } from '@true-north/enum';

export type TrackTimeWithoutRelationsVo = {
  relatedType?: TrackTimeRelatedType;
  relatedId?: string;
  startAt?: string;
  endAt?: string;
  duration?: number;
  notes?: string;
} & BaseEntityVo;

export type TrackTimeVo = TrackTimeWithoutRelationsVo;
