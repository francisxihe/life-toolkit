import { RepeatEndMode } from './repeat-end';
import { RepeatMode } from './repeat';

/**
 * A repeat configuration is persisted and forwarded by consumers, but its
 * structure is owned and validated exclusively by @true-north/components-repeat.
 */
export type RepeatConfigPayload = unknown;

export type RepeatSettingPayload = {
  repeatMode: RepeatMode;
  repeatConfig?: RepeatConfigPayload;
  repeatEndMode: RepeatEndMode;
  repeatTimes?: number;
  repeatEndDate?: string;
};

export type RepeatPayload = RepeatSettingPayload & {
  repeatStartDate: string;
};

export type RepeatVo = RepeatSettingPayload & {
  repeatStartDate?: string;
  currentDate?: string;
  repeatedTimes?: number;
};

export type CreateRepeatVo = RepeatSettingPayload & {
  repeatStartDate: string;
  currentDate: string;
};

export type UpdateRepeatVo = Omit<RepeatSettingPayload, 'repeatMode' | 'repeatConfig'> & {
  repeatMode?: RepeatMode;
  repeatConfig?: RepeatConfigPayload;
  repeatStartDate?: string;
};
