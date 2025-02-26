import { BaseModelVo } from "../base";

export type TrackTimeModelVo = {
  startAt?: string;

  endAt?: string;

  duration?: number;

  notes?: string;
};

export type TrackTimeVo = BaseModelVo & TrackTimeModelVo;
