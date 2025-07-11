import { OrdinalWeek, OrdinalDayType, OrdinalDay } from "./ordinal";
import { WeekDay, TimeUnit } from "./base";

export enum RepeatMode {
  NONE = "none",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  WEEKDAYS = "weekdays",
  WEEKEND = "weekend",
  WORKDAYS = "workdays",
  REST_DAY = "restDay",
  CUSTOM = "custom",
}

export type RepeatFormNormal = {
  repeatMode:
    | RepeatMode.NONE
    | RepeatMode.DAILY
    | RepeatMode.WEEKDAYS
    | RepeatMode.WEEKEND
    | RepeatMode.WORKDAYS
    | RepeatMode.REST_DAY;
};

export type RepeatFormWeekly = {
  repeatMode: RepeatMode.WEEKLY;
  repeatConfig: {
    weekdays: WeekDay[];
  };
};

export enum MonthlyType {
  DAY = "day",
  ORDINAL_WEEK = "ordinalWeek",
  ORDINAL_DAY = "ordinalDay",
}

type RepeatConfigOrdinalDay = {
  ordinalDay: OrdinalDay;
  ordinalDayType: OrdinalDayType;
};

type RepeatConfigOrdinalWeek = {
  ordinalWeek: OrdinalWeek;
  ordinalWeekdays: WeekDay[];
};

type RepeatConfigMonthly =
  | {
      monthlyType: MonthlyType.DAY;
      [MonthlyType.DAY]: number;
    }
  | {
      monthlyType: MonthlyType.ORDINAL_WEEK;
      [MonthlyType.ORDINAL_WEEK]: RepeatConfigOrdinalWeek;
    }
  | {
      monthlyType: MonthlyType.ORDINAL_DAY;
      [MonthlyType.ORDINAL_DAY]: RepeatConfigOrdinalDay;
    };

export type RepeatFormMonthly = {
  repeatMode: RepeatMode.MONTHLY;
  repeatConfig: RepeatConfigMonthly;
};

export enum YearlyType {
  MONTH = "month",
  ORDINAL_WEEK = "ordinalWeek",
}

export type RepeatFormYearly = {
  repeatMode: RepeatMode.YEARLY;
  repeatConfig:
    | {
        yearlyType: YearlyType.MONTH;
        [YearlyType.MONTH]: RepeatConfigMonthly;
      }
    | {
        yearlyType: YearlyType.ORDINAL_WEEK;
        [YearlyType.ORDINAL_WEEK]: RepeatConfigOrdinalWeek;
      };
};

export type RepeatFormCustom = {
  repeatMode: RepeatMode.CUSTOM;
  repeatConfig:
    | {
        interval: number;
        intervalUnit: TimeUnit.DAY;
      }
    | {
        interval: number;
        intervalUnit: TimeUnit.WEEK;
        [TimeUnit.WEEK]: RepeatFormWeekly["repeatConfig"];
      }
    | {
        interval: number;
        intervalUnit: TimeUnit.MONTH;
        [TimeUnit.MONTH]: RepeatFormMonthly["repeatConfig"];
      }
    | {
        interval: number;
        intervalUnit: TimeUnit.YEAR;
        [TimeUnit.YEAR]: RepeatFormYearly["repeatConfig"];
      };
};

export type RepeatConfig =
  | RepeatFormWeekly["repeatConfig"]
  | RepeatFormMonthly["repeatConfig"]
  | RepeatFormYearly["repeatConfig"]
  | RepeatFormCustom["repeatConfig"];

export type RepeatModeForm =
  | RepeatFormNormal
  | RepeatFormCustom
  | RepeatFormYearly
  | RepeatFormMonthly
  | RepeatFormWeekly;
