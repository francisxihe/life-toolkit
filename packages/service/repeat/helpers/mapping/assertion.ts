import {
  RepeatFormWeekly,
  RepeatFormMonthly,
  RepeatFormYearly,
  RepeatFormCustom,
  RepeatMode,
  RepeatVo,
} from '@life-toolkit/service-repeat-types';

export function isRepeatVoFormWeekly(repeatVo: RepeatVo): repeatVo is RepeatVo & {
  repeatMode: RepeatMode.WEEKLY;
  repeatConfig: RepeatFormWeekly['repeatConfig'];
} {
  return repeatVo.repeatMode === RepeatMode.WEEKLY;
}

export function isRepeatVoFormMonthly(repeatVo: RepeatVo): repeatVo is RepeatVo & {
  repeatMode: RepeatMode.MONTHLY;
  repeatConfig: RepeatFormMonthly['repeatConfig'];
} {
  return repeatVo.repeatMode === RepeatMode.MONTHLY;
}

export function isRepeatVoFormYearly(repeatVo: RepeatVo): repeatVo is RepeatVo & {
  repeatMode: RepeatMode.YEARLY;
  repeatConfig: RepeatFormYearly['repeatConfig'];
} {
  return repeatVo.repeatMode === RepeatMode.YEARLY;
}

export function isRepeatVoFormCustom(
  repeatVo: RepeatVo
): repeatVo is RepeatVo & { repeatMode: RepeatMode.CUSTOM; repeatConfig: RepeatFormCustom['repeatConfig'] } {
  return repeatVo.repeatMode === RepeatMode.CUSTOM;
}
