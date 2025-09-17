import dayjs from 'dayjs';
import { isArray, isString, isNumber } from 'lodash';
import {
  RepeatModeForm,
  RepeatEndModeForm,
  RepeatEndMode,
  RepeatMode,
  RepeatVo,
} from '@life-toolkit/service-repeat-types';
import { isRepeatVoFormWeekly, isRepeatVoFormMonthly, isRepeatVoFormYearly, isRepeatVoFormCustom } from './assertion';

export function voToForm(repeatVo: RepeatVo): RepeatModeForm & RepeatEndModeForm {
  let repeatModeForm: RepeatModeForm;

  switch (repeatVo.repeatMode) {
    // 普通模式：不需要 repeatConfig
    case RepeatMode.NONE:
    case RepeatMode.DAILY:
    case RepeatMode.WEEKDAYS:
    case RepeatMode.WEEKEND:
    case RepeatMode.WORKDAYS:
    case RepeatMode.REST_DAY: {
      repeatModeForm = { repeatMode: repeatVo.repeatMode } as RepeatModeForm;
      break;
    }

    // 周期模式：需要特定 repeatConfig
    case RepeatMode.WEEKLY: {
      if (!isRepeatVoFormWeekly(repeatVo) || !isArray(repeatVo.repeatConfig?.weekdays)) {
        throw new Error('repeatConfig.weekdays is required for WEEKLY mode');
      }
      repeatModeForm = {
        repeatMode: RepeatMode.WEEKLY,
        repeatConfig: repeatVo.repeatConfig,
      } as RepeatModeForm;
      break;
    }

    case RepeatMode.MONTHLY: {
      if (!isRepeatVoFormMonthly(repeatVo) || !isString(repeatVo.repeatConfig?.monthlyType)) {
        throw new Error('repeatConfig.monthlyType is required for MONTHLY mode');
      }
      repeatModeForm = {
        repeatMode: RepeatMode.MONTHLY,
        repeatConfig: repeatVo.repeatConfig,
      } as RepeatModeForm;
      break;
    }

    case RepeatMode.YEARLY: {
      if (!isRepeatVoFormYearly(repeatVo) || !isString(repeatVo.repeatConfig?.yearlyType)) {
        throw new Error('repeatConfig.yearlyType is required for YEARLY mode');
      }
      repeatModeForm = {
        repeatMode: RepeatMode.YEARLY,
        repeatConfig: repeatVo.repeatConfig,
      } as RepeatModeForm;
      break;
    }

    case RepeatMode.CUSTOM: {
      if (
        !isRepeatVoFormCustom(repeatVo) ||
        !isNumber(repeatVo.repeatConfig?.interval) ||
        !isString(repeatVo.repeatConfig?.intervalUnit)
      ) {
        throw new Error('repeatConfig.interval and intervalUnit are required for CUSTOM mode');
      }
      repeatModeForm = {
        repeatMode: RepeatMode.CUSTOM,
        repeatConfig: repeatVo.repeatConfig,
      } as RepeatModeForm;
      break;
    }

    default: {
      throw new Error(`Unknown repeatMode: ${String(repeatVo.repeatMode)}`);
    }
  }

  let repeatEndModeForm: RepeatEndModeForm;

  switch (repeatVo.repeatEndMode) {
    case RepeatEndMode.FOREVER:
      repeatEndModeForm = { repeatEndMode: repeatVo.repeatEndMode };
      break;
    case RepeatEndMode.TO_DATE:
      if (!isString(repeatVo.repeatEndDate)) {
        throw new Error('repeatEndDate is required');
      }
      repeatEndModeForm = {
        repeatEndMode: repeatVo.repeatEndMode,
        repeatEndDate: dayjs(repeatVo.repeatEndDate),
      };
      break;
    case RepeatEndMode.FOR_TIMES:
      if (!isNumber(repeatVo.repeatTimes) || repeatVo.repeatTimes <= 0) {
        throw new Error('repeatTimes is required');
      }
      repeatEndModeForm = {
        repeatEndMode: repeatVo.repeatEndMode,
        repeatTimes: repeatVo.repeatTimes,
      };
      break;
  }

  return { ...repeatModeForm, ...repeatEndModeForm };
}

export function formToVo(form: RepeatModeForm & RepeatEndModeForm): RepeatVo {
  let repeatConfig: RepeatVo['repeatConfig'] | undefined;
  switch (form.repeatMode) {
    case RepeatMode.NONE:
    case RepeatMode.DAILY:
    case RepeatMode.WEEKDAYS:
    case RepeatMode.WEEKEND:
    case RepeatMode.WORKDAYS:
    case RepeatMode.REST_DAY:
      repeatConfig = undefined;
      break;
    case RepeatMode.WEEKLY:
    case RepeatMode.MONTHLY:
    case RepeatMode.YEARLY:
    case RepeatMode.CUSTOM:
      repeatConfig = form.repeatConfig;
      break;
  }

  let repeatTimes: number | undefined;
  let repeatEndDate: string | undefined;
  switch (form.repeatEndMode) {
    case RepeatEndMode.FOREVER:
      break;
    case RepeatEndMode.TO_DATE:
      repeatEndDate = form.repeatEndDate.format('YYYY-MM-DD');
      break;
    case RepeatEndMode.FOR_TIMES:
      repeatTimes = form.repeatTimes;
      break;
  }

  return {
    repeatMode: form.repeatMode,
    repeatConfig,
    repeatEndMode: form.repeatEndMode,
    repeatTimes,
    repeatEndDate,
  };
}

export default {
  voToForm,
  formToVo,
};
