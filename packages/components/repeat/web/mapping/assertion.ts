import { RepeatMode } from "../../types";
import type { RepeatVo } from "../../vo";
import type {
  RepeatFormWeekly,
  RepeatFormMonthly,
  RepeatFormYearly,
  RepeatFormCustom,
} from "../../types";

export function isRepeatFormWeekly(
  repeatVo: RepeatVo
): repeatVo is RepeatVo & {
  repeatMode: RepeatMode.WEEKLY;
  repeatConfig: RepeatFormWeekly["repeatConfig"];
} {
  return repeatVo.repeatMode === RepeatMode.WEEKLY;
}

export function isRepeatFormMonthly(
  repeatVo: RepeatVo
): repeatVo is RepeatVo & {
  repeatMode: RepeatMode.MONTHLY;
  repeatConfig: RepeatFormMonthly["repeatConfig"];
} {
  return repeatVo.repeatMode === RepeatMode.MONTHLY;
}

export function isRepeatFormYearly(
  repeatVo: RepeatVo
): repeatVo is RepeatVo & {
  repeatMode: RepeatMode.YEARLY;
  repeatConfig: RepeatFormYearly["repeatConfig"];
} {
  return repeatVo.repeatMode === RepeatMode.YEARLY;
}

export function isRepeatFormCustom(
  repeatVo: RepeatVo
): repeatVo is RepeatVo & { repeatMode: RepeatMode.CUSTOM; repeatConfig: RepeatFormCustom["repeatConfig"] } {
  return repeatVo.repeatMode === RepeatMode.CUSTOM;
}
