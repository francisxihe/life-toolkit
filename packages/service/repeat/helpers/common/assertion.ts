import {
  RepeatMode,
  RepeatFormWeekly,
  RepeatFormMonthly,
  RepeatFormYearly,
  RepeatFormCustom,
  MonthlyType,
  YearlyType,
  TimeUnit,
  RepeatConfigOrdinalWeek,
  RepeatConfigOrdinalDay,
  RepeatConfigMonthly,
} from '@life-toolkit/service-repeat-types';
import { Repeat } from './types';

export function isRepeatFormWeeklyConfig(value: Repeat): value is Repeat & RepeatFormWeekly {
  return value.repeatMode === RepeatMode.WEEKLY;
}

export function isRepeatFormMonthlyConfig(value: Repeat): value is Repeat & RepeatFormMonthly {
  return value.repeatMode === RepeatMode.MONTHLY;
}

export function isRepeatFormYearlyConfig(value: Repeat): value is Repeat & RepeatFormYearly {
  return value.repeatMode === RepeatMode.YEARLY;
}

export function isRepeatFormCustomConfig(value: Repeat): value is Repeat & RepeatFormCustom {
  return value.repeatMode === RepeatMode.CUSTOM;
}

export function isMonthlyTypeDay(value: RepeatConfigMonthly): value is {
  monthlyType: MonthlyType.DAY;
  [MonthlyType.DAY]: number;
} {
  return value.monthlyType === MonthlyType.DAY;
}

export function isMonthlyTypeOrdinalWeek(value: RepeatConfigMonthly): value is {
  monthlyType: MonthlyType.ORDINAL_WEEK;
  [MonthlyType.ORDINAL_WEEK]: RepeatConfigOrdinalWeek;
} {
  return value.monthlyType === MonthlyType.ORDINAL_WEEK;
}

export function isMonthlyTypeOrdinalDay(value: RepeatConfigMonthly): value is {
  monthlyType: MonthlyType.ORDINAL_DAY;
  [MonthlyType.ORDINAL_DAY]: RepeatConfigOrdinalDay;
} {
  return value.monthlyType === MonthlyType.ORDINAL_DAY;
}

export function isYearlyTypeMonthConfig(value: RepeatFormYearly['repeatConfig']): value is {
  yearlyType: YearlyType.MONTH;
  [YearlyType.MONTH]: RepeatConfigMonthly & { month: number[] };
} {
  return value.yearlyType === YearlyType.MONTH;
}

export function isYearlyTypeOrdinalWeekConfig(value: RepeatFormYearly['repeatConfig']): value is {
  yearlyType: YearlyType.ORDINAL_WEEK;
  [YearlyType.ORDINAL_WEEK]: RepeatConfigOrdinalWeek;
} {
  return value.yearlyType === YearlyType.ORDINAL_WEEK;
}

export function isCustomIntervalDayConfig(value: RepeatFormCustom['repeatConfig']): value is {
  interval: number;
  intervalUnit: TimeUnit.DAY;
} {
  return value.intervalUnit === TimeUnit.DAY;
}

export function isCustomIntervalWeekConfig(value: RepeatFormCustom['repeatConfig']): value is {
  interval: number;
  intervalUnit: TimeUnit.WEEK;
  [TimeUnit.WEEK]: RepeatFormWeekly['repeatConfig'];
} {
  return value.intervalUnit === TimeUnit.WEEK;
}

export function isCustomIntervalMonthConfig(value: RepeatFormCustom['repeatConfig']): value is {
  interval: number;
  intervalUnit: TimeUnit.MONTH;
  [TimeUnit.MONTH]: RepeatFormMonthly['repeatConfig'];
} {
  return value.intervalUnit === TimeUnit.MONTH;
}

export function isCustomIntervalYearConfig(value: RepeatFormCustom['repeatConfig']): value is {
  interval: number;
  intervalUnit: TimeUnit.YEAR;
  [TimeUnit.YEAR]: RepeatFormYearly['repeatConfig'];
} {
  return value.intervalUnit === TimeUnit.YEAR;
}
