import {
  MonthlyType,
  OrdinalDay,
  OrdinalDayType,
  OrdinalWeek,
  RepeatEndMode,
  RepeatMode,
  TimeUnit,
  WeekDay,
  YearlyType,
} from '../types';

export type RepeatFormNormal = {
  repeatMode:
    | RepeatMode.NONE
    | RepeatMode.DAILY
    | RepeatMode.WEEKDAYS
    | RepeatMode.WEEKEND
    | RepeatMode.WORKDAYS
    | RepeatMode.REST_DAY;
  repeatConfig?: never;
};

export type RepeatFormWeekly = {
  repeatMode: RepeatMode.WEEKLY;
  repeatConfig: { weekdays: WeekDay[] };
};

export type RepeatConfigOrdinalDay = {
  ordinalDay: OrdinalDay;
  ordinalDayType: OrdinalDayType;
};

export type RepeatConfigOrdinalWeek = {
  ordinalWeek: OrdinalWeek;
  ordinalWeekdays: WeekDay[];
};

export type RepeatConfigMonthly =
  | { monthlyType: MonthlyType.DAY; [MonthlyType.DAY]: number }
  | { monthlyType: MonthlyType.ORDINAL_WEEK; [MonthlyType.ORDINAL_WEEK]: RepeatConfigOrdinalWeek }
  | { monthlyType: MonthlyType.ORDINAL_DAY; [MonthlyType.ORDINAL_DAY]: RepeatConfigOrdinalDay };

export type RepeatFormMonthly = {
  repeatMode: RepeatMode.MONTHLY;
  repeatConfig: RepeatConfigMonthly;
};

export type RepeatFormYearly = {
  repeatMode: RepeatMode.YEARLY;
  repeatConfig:
    | {
        yearlyType: YearlyType.MONTH;
        [YearlyType.MONTH]: RepeatConfigMonthly & { month: number[] };
      }
    | { yearlyType: YearlyType.ORDINAL_WEEK; [YearlyType.ORDINAL_WEEK]: RepeatConfigOrdinalWeek };
};

export type RepeatFormCustom = {
  repeatMode: RepeatMode.CUSTOM;
  repeatConfig:
    | { interval: number; intervalUnit: TimeUnit.DAY }
    | { interval: number; intervalUnit: TimeUnit.WEEK; [TimeUnit.WEEK]: RepeatFormWeekly['repeatConfig'] }
    | { interval: number; intervalUnit: TimeUnit.MONTH; [TimeUnit.MONTH]: RepeatFormMonthly['repeatConfig'] }
    | { interval: number; intervalUnit: TimeUnit.YEAR; [TimeUnit.YEAR]: RepeatFormYearly['repeatConfig'] };
};

export type RepeatModeForm =
  | RepeatFormNormal
  | RepeatFormWeekly
  | RepeatFormMonthly
  | RepeatFormYearly
  | RepeatFormCustom;

export type RepeatEndModeForm =
  | { repeatEndMode: RepeatEndMode.FOREVER; repeatTimes?: never; repeatEndDate?: never }
  | { repeatEndMode: RepeatEndMode.FOR_TIMES; repeatTimes: number; repeatEndDate?: never }
  | { repeatEndMode: RepeatEndMode.TO_DATE; repeatEndDate: string; repeatTimes?: never };

export type RepeatSetting = RepeatModeForm & RepeatEndModeForm;
export type RepeatRule = RepeatSetting & { repeatStartDate: string };
