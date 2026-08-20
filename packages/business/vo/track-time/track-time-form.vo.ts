import { TrackTimeWithoutRelationsVo } from './track-time-model.vo';

export type CreateTrackTimeVo = Pick<
  TrackTimeWithoutRelationsVo,
  'relatedType' | 'relatedId' | 'startAt' | 'endAt' | 'duration' | 'notes'
>;

export type UpdateTrackTimeVo = Partial<CreateTrackTimeVo>;
