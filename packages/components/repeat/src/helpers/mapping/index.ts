import dayjs from 'dayjs';
import {
  RepeatEndMode,
  RepeatMode,
  type RepeatVo,
} from '../../types';
import { parseRepeatSetting, type RepeatModeForm } from '../../core';

type RepeatSelectorForm = RepeatModeForm & (
  | { repeatEndMode: RepeatEndMode.FOREVER }
  | { repeatEndMode: RepeatEndMode.FOR_TIMES; repeatTimes: number }
  | { repeatEndMode: RepeatEndMode.TO_DATE; repeatEndDate: dayjs.Dayjs }
);

export function voToForm(repeatVo: RepeatVo): RepeatSelectorForm {
  const parsed = parseRepeatSetting(repeatVo);
  if (parsed.ok === false) throw new Error(parsed.issues.map((item) => item.message).join(' '));

  switch (parsed.value.repeatEndMode) {
    case RepeatEndMode.FOREVER:
      return { ...parsed.value, repeatEndMode: RepeatEndMode.FOREVER };
    case RepeatEndMode.TO_DATE:
      return { ...parsed.value, repeatEndDate: dayjs(parsed.value.repeatEndDate) };
    case RepeatEndMode.FOR_TIMES:
      return { ...parsed.value, repeatTimes: parsed.value.repeatTimes };
  }
}

export function formToVo(form: RepeatSelectorForm): RepeatVo {
  switch (form.repeatEndMode) {
    case RepeatEndMode.TO_DATE:
      return {
        repeatMode: form.repeatMode,
        repeatConfig: 'repeatConfig' in form ? form.repeatConfig : undefined,
        repeatEndMode: form.repeatEndMode,
        repeatEndDate: form.repeatEndDate.format('YYYY-MM-DD'),
      };
    case RepeatEndMode.FOR_TIMES:
      return {
        repeatMode: form.repeatMode,
        repeatConfig: 'repeatConfig' in form ? form.repeatConfig : undefined,
        repeatEndMode: form.repeatEndMode,
        repeatTimes: form.repeatTimes,
      };
    case RepeatEndMode.FOREVER:
      return {
        repeatMode: form.repeatMode,
        repeatConfig: 'repeatConfig' in form ? form.repeatConfig : undefined,
        repeatEndMode: form.repeatEndMode,
      };
  }
}

export default {
  voToForm,
  formToVo,
};
