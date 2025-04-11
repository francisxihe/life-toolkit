import { RepeatMode, RepeatConfig, RepeatEndMode } from "../types";

export type RepeatVo = {
  repeatMode: RepeatMode;

  repeatConfig: RepeatConfig;

  repeatEndMode: RepeatEndMode;

  repeatTimes?: number;

  repeatEndDate?: string;
};

export type CreateRepeatVo = {
  repeatMode: RepeatMode;
  repeatConfig: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatTimes?: number;
  repeatEndDate?: string;
};

export type UpdateRepeatVo = {
  repeatMode: RepeatMode;
  repeatConfig: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatTimes?: number;
  repeatEndDate?: string;
  id: string;
};
