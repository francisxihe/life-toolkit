import { TrackTimeWithoutRelationsVo } from './track-time-model.vo';

export type TrackTimeFilterVo = {
  startAtStart?: string;
  startAtEnd?: string;
  endAtStart?: string;
  endAtEnd?: string;
  minDuration?: number;
  maxDuration?: number;
  id?: string;
} & Partial<Pick<TrackTimeWithoutRelationsVo, 'relatedType' | 'relatedId'>>;

export type TrackTimePageFilterVo = TrackTimeFilterVo & { pageNum: number; pageSize: number };
