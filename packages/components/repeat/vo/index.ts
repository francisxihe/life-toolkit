import { RepeatMode, RepeatConfig, RepeatEndMode } from '../types';

export type RepeatVo = {
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatTimes?: number;
  repeatEndDate?: string;
  repeatStartDate?: string;
  currentDate?: string;
  repeatedTimes?: number;
};

export type CreateRepeatVo = {
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatTimes?: number;
  repeatEndDate?: string;
  repeatStartDate: string;
  currentDate: string;
};

export type UpdateRepeatVo = {
  repeatMode?: RepeatMode;
  repeatConfig?: RepeatConfig;
  repeatEndMode: RepeatEndMode;
  repeatTimes?: number;
  repeatEndDate?: string;
  repeatStartDate?: string;
};
