export enum RepeatMode {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  WEEKDAYS = 'weekdays',
  WEEKEND = 'weekend',
  WORKDAYS = 'workdays',
  REST_DAY = 'restDay',
  CUSTOM = 'custom',
}

export enum MonthlyType {
  DAY = 'day',
  ORDINAL_WEEK = 'ordinalWeek',
  ORDINAL_DAY = 'ordinalDay',
}

export enum YearlyType {
  MONTH = 'month',
  ORDINAL_WEEK = 'ordinalWeek',
}
