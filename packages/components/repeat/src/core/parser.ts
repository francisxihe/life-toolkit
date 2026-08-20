import dayjs from 'dayjs';
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
  type RepeatPayload,
  type RepeatSettingPayload,
} from '../types';
import type {
  RepeatConfigMonthly,
  RepeatConfigOrdinalDay,
  RepeatConfigOrdinalWeek,
  RepeatFormCustom,
  RepeatFormYearly,
  RepeatRule,
  RepeatSetting,
} from './types';

export type ValidationIssue = {
  path: string;
  code: 'invalid_type' | 'invalid_value' | 'missing_field' | 'unexpected_field';
  message: string;
};

export type ParseResult<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] };

export class RepeatValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super('Invalid repeat rule.');
    this.name = 'RepeatValidationError';
  }
}

type JsonRecord = Record<string, unknown>;

const normalModes = new Set<RepeatMode>([
  RepeatMode.NONE,
  RepeatMode.DAILY,
  RepeatMode.WEEKDAYS,
  RepeatMode.WEEKEND,
  RepeatMode.WORKDAYS,
  RepeatMode.REST_DAY,
]);
const weekDays = new Set<number>(Object.values(WeekDay).filter((value): value is number => typeof value === 'number'));
const ordinalDays = new Set<number>(Object.values(OrdinalDay).filter((value): value is number => typeof value === 'number'));
const ordinalWeeks = new Set<number>(Object.values(OrdinalWeek).filter((value): value is number => typeof value === 'number'));
const ordinalDayTypes = new Set<string>(Object.values(OrdinalDayType));

function issue(
  issues: ValidationIssue[],
  path: string,
  code: ValidationIssue['code'],
  message: string
): void {
  issues.push({ path, code, message });
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ensureRecord(value: unknown, path: string, issues: ValidationIssue[]): JsonRecord | undefined {
  if (!isRecord(value)) {
    issue(issues, path, 'invalid_type', 'Expected an object.');
    return undefined;
  }
  return value;
}

function ensureKeys(record: JsonRecord, allowed: string[], path: string, issues: ValidationIssue[]): void {
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(record)) {
    if (!allowedKeys.has(key)) {
      issue(issues, `${path}.${key}`, 'unexpected_field', 'Field is not allowed for this repeat rule.');
    }
  }
}

function requireString(record: JsonRecord, key: string, path: string, issues: ValidationIssue[]): string | undefined {
  const value = record[key];
  if (typeof value !== 'string') {
    issue(issues, `${path}.${key}`, value === undefined ? 'missing_field' : 'invalid_type', 'Expected a string.');
    return undefined;
  }
  return value;
}

function requireInteger(
  record: JsonRecord,
  key: string,
  path: string,
  issues: ValidationIssue[],
  predicate: (value: number) => boolean,
  message: string
): number | undefined {
  const value = record[key];
  if (!Number.isInteger(value) || !predicate(value as number)) {
    issue(issues, `${path}.${key}`, value === undefined ? 'missing_field' : 'invalid_value', message);
    return undefined;
  }
  return value as number;
}

function parseWeekdays(value: unknown, path: string, issues: ValidationIssue[]): WeekDay[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    issue(issues, path, value === undefined ? 'missing_field' : 'invalid_type', 'Expected a non-empty weekday array.');
    return undefined;
  }
  if (value.some((day) => !weekDays.has(day as number))) {
    issue(issues, path, 'invalid_value', 'Weekdays must be integers from 1 to 7.');
    return undefined;
  }
  return [...new Set(value as WeekDay[])];
}

function parseOrdinalWeekConfig(value: unknown, path: string, issues: ValidationIssue[]): RepeatConfigOrdinalWeek | undefined {
  const record = ensureRecord(value, path, issues);
  if (!record) return undefined;
  ensureKeys(record, ['ordinalWeek', 'ordinalWeekdays'], path, issues);
  const ordinalWeek = requireInteger(record, 'ordinalWeek', path, issues, (item) => ordinalWeeks.has(item), 'Invalid ordinal week.');
  const ordinalWeekdays = parseWeekdays(record.ordinalWeekdays, `${path}.ordinalWeekdays`, issues);
  return ordinalWeek !== undefined && ordinalWeekdays ? { ordinalWeek: ordinalWeek as OrdinalWeek, ordinalWeekdays } : undefined;
}

function parseOrdinalDayConfig(value: unknown, path: string, issues: ValidationIssue[]): RepeatConfigOrdinalDay | undefined {
  const record = ensureRecord(value, path, issues);
  if (!record) return undefined;
  ensureKeys(record, ['ordinalDay', 'ordinalDayType'], path, issues);
  const ordinalDay = requireInteger(record, 'ordinalDay', path, issues, (item) => ordinalDays.has(item), 'Invalid ordinal day.');
  const ordinalDayType = requireString(record, 'ordinalDayType', path, issues);
  if (ordinalDayType && !ordinalDayTypes.has(ordinalDayType)) {
    issue(issues, `${path}.ordinalDayType`, 'invalid_value', 'Invalid ordinal day type.');
  }
  return ordinalDay !== undefined && ordinalDayType && ordinalDayTypes.has(ordinalDayType)
    ? { ordinalDay: ordinalDay as OrdinalDay, ordinalDayType: ordinalDayType as OrdinalDayType }
    : undefined;
}

function parseMonthlyConfig(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  extraAllowedKeys: string[] = []
): RepeatConfigMonthly | undefined {
  const record = ensureRecord(value, path, issues);
  if (!record) return undefined;
  const monthlyType = requireString(record, 'monthlyType', path, issues);
  if (!monthlyType || !Object.values(MonthlyType).includes(monthlyType as MonthlyType)) {
    if (monthlyType) issue(issues, `${path}.monthlyType`, 'invalid_value', 'Invalid monthly type.');
    return undefined;
  }

  switch (monthlyType as MonthlyType) {
    case MonthlyType.DAY: {
      ensureKeys(record, ['monthlyType', MonthlyType.DAY, ...extraAllowedKeys], path, issues);
      const day = requireInteger(record, MonthlyType.DAY, path, issues, (item) => item >= 1 && item <= 31, 'Day must be between 1 and 31.');
      return day === undefined ? undefined : { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: day };
    }
    case MonthlyType.ORDINAL_WEEK: {
      ensureKeys(record, ['monthlyType', MonthlyType.ORDINAL_WEEK, ...extraAllowedKeys], path, issues);
      const ordinalWeek = parseOrdinalWeekConfig(record[MonthlyType.ORDINAL_WEEK], `${path}.${MonthlyType.ORDINAL_WEEK}`, issues);
      return ordinalWeek
        ? { monthlyType: MonthlyType.ORDINAL_WEEK, [MonthlyType.ORDINAL_WEEK]: ordinalWeek }
        : undefined;
    }
    case MonthlyType.ORDINAL_DAY: {
      ensureKeys(record, ['monthlyType', MonthlyType.ORDINAL_DAY, ...extraAllowedKeys], path, issues);
      const ordinalDay = parseOrdinalDayConfig(record[MonthlyType.ORDINAL_DAY], `${path}.${MonthlyType.ORDINAL_DAY}`, issues);
      return ordinalDay
        ? { monthlyType: MonthlyType.ORDINAL_DAY, [MonthlyType.ORDINAL_DAY]: ordinalDay }
        : undefined;
    }
  }
}

function parseYearlyConfig(value: unknown, path: string, issues: ValidationIssue[]): RepeatFormYearly['repeatConfig'] | undefined {
  const record = ensureRecord(value, path, issues);
  if (!record) return undefined;
  const yearlyType = requireString(record, 'yearlyType', path, issues);
  if (!yearlyType || !Object.values(YearlyType).includes(yearlyType as YearlyType)) {
    if (yearlyType) issue(issues, `${path}.yearlyType`, 'invalid_value', 'Invalid yearly type.');
    return undefined;
  }

  if (yearlyType === YearlyType.MONTH) {
    ensureKeys(record, ['yearlyType', YearlyType.MONTH], path, issues);
    const monthConfigRecord = ensureRecord(record[YearlyType.MONTH], `${path}.${YearlyType.MONTH}`, issues);
    if (!monthConfigRecord) return undefined;
    const monthConfig = parseMonthlyConfig(monthConfigRecord, `${path}.${YearlyType.MONTH}`, issues, ['month']);
    const month = monthConfigRecord.month;
    if (!Array.isArray(month) || month.some((item) => !Number.isInteger(item) || item < 1 || item > 12)) {
      issue(issues, `${path}.${YearlyType.MONTH}.month`, month === undefined ? 'missing_field' : 'invalid_value', 'Months must be integers from 1 to 12.');
      return undefined;
    }
    return monthConfig
      ? { yearlyType: YearlyType.MONTH, [YearlyType.MONTH]: { ...monthConfig, month: [...new Set(month as number[])] } }
      : undefined;
  }

  ensureKeys(record, ['yearlyType', YearlyType.ORDINAL_WEEK], path, issues);
  const ordinalWeek = parseOrdinalWeekConfig(record[YearlyType.ORDINAL_WEEK], `${path}.${YearlyType.ORDINAL_WEEK}`, issues);
  return ordinalWeek
    ? { yearlyType: YearlyType.ORDINAL_WEEK, [YearlyType.ORDINAL_WEEK]: ordinalWeek }
    : undefined;
}

function parseCustomConfig(value: unknown, path: string, issues: ValidationIssue[]): RepeatFormCustom['repeatConfig'] | undefined {
  const record = ensureRecord(value, path, issues);
  if (!record) return undefined;
  const interval = requireInteger(record, 'interval', path, issues, (item) => item > 0, 'Interval must be a positive integer.');
  const intervalUnit = requireString(record, 'intervalUnit', path, issues);
  if (!intervalUnit || !Object.values(TimeUnit).includes(intervalUnit as TimeUnit)) {
    if (intervalUnit && !Object.values(TimeUnit).includes(intervalUnit as TimeUnit)) {
      issue(issues, `${path}.intervalUnit`, 'invalid_value', 'Invalid interval unit.');
    }
    return undefined;
  }

  switch (intervalUnit as TimeUnit) {
    case TimeUnit.DAY:
      ensureKeys(record, ['interval', 'intervalUnit'], path, issues);
      return interval === undefined ? undefined : { interval, intervalUnit: TimeUnit.DAY };
    case TimeUnit.WEEK: {
      ensureKeys(record, ['interval', 'intervalUnit', TimeUnit.WEEK], path, issues);
      const weekdays = ensureRecord(record[TimeUnit.WEEK], `${path}.${TimeUnit.WEEK}`, issues);
      const parsed = weekdays ? parseWeekdays(weekdays.weekdays, `${path}.${TimeUnit.WEEK}.weekdays`, issues) : undefined;
      if (weekdays) ensureKeys(weekdays, ['weekdays'], `${path}.${TimeUnit.WEEK}`, issues);
      return interval !== undefined && parsed
        ? { interval, intervalUnit: TimeUnit.WEEK, [TimeUnit.WEEK]: { weekdays: parsed } }
        : undefined;
    }
    case TimeUnit.MONTH: {
      ensureKeys(record, ['interval', 'intervalUnit', TimeUnit.MONTH], path, issues);
      const monthly = parseMonthlyConfig(record[TimeUnit.MONTH], `${path}.${TimeUnit.MONTH}`, issues);
      return interval !== undefined && monthly ? { interval, intervalUnit: TimeUnit.MONTH, [TimeUnit.MONTH]: monthly } : undefined;
    }
    case TimeUnit.YEAR: {
      ensureKeys(record, ['interval', 'intervalUnit', TimeUnit.YEAR], path, issues);
      const yearly = parseYearlyConfig(record[TimeUnit.YEAR], `${path}.${TimeUnit.YEAR}`, issues);
      return interval !== undefined && yearly ? { interval, intervalUnit: TimeUnit.YEAR, [TimeUnit.YEAR]: yearly } : undefined;
    }
  }
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).format('YYYY-MM-DD') === value;
}

/** Validates the UI/storage portion of a repeat rule without a start date. */
export function parseRepeatSetting(input: unknown): ParseResult<RepeatSetting> {
  const issues: ValidationIssue[] = [];
  const inputRecord = ensureRecord(input, 'repeat', issues);
  if (!inputRecord) return { ok: false, issues };
  // SQLite returns NULL for optional columns. At the package boundary, NULL and
  // an omitted optional field have the same recurrence meaning.
  const record: JsonRecord = {
    ...inputRecord,
    repeatConfig: inputRecord.repeatConfig ?? undefined,
    repeatTimes: inputRecord.repeatTimes ?? undefined,
    repeatEndDate: inputRecord.repeatEndDate ?? undefined,
  };
  ensureKeys(record, ['repeatMode', 'repeatConfig', 'repeatEndMode', 'repeatTimes', 'repeatEndDate'], 'repeat', issues);

  const repeatMode = requireString(record, 'repeatMode', 'repeat', issues);
  const repeatEndMode = requireString(record, 'repeatEndMode', 'repeat', issues);
  if (!repeatMode || !Object.values(RepeatMode).includes(repeatMode as RepeatMode)) {
    if (repeatMode) issue(issues, 'repeat.repeatMode', 'invalid_value', 'Invalid repeat mode.');
  }
  if (!repeatEndMode || !Object.values(RepeatEndMode).includes(repeatEndMode as RepeatEndMode)) {
    if (repeatEndMode) issue(issues, 'repeat.repeatEndMode', 'invalid_value', 'Invalid repeat end mode.');
  }

  let modeForm: unknown;
  if (repeatMode && Object.values(RepeatMode).includes(repeatMode as RepeatMode)) {
    const mode = repeatMode as RepeatMode;
    if (normalModes.has(mode)) {
      if (record.repeatConfig !== undefined) {
        issue(issues, 'repeat.repeatConfig', 'unexpected_field', 'This repeat mode does not accept a config.');
      }
      modeForm = { repeatMode: mode };
    } else if (mode === RepeatMode.WEEKLY) {
      const config = ensureRecord(record.repeatConfig, 'repeat.repeatConfig', issues);
      const weekdays = config ? parseWeekdays(config.weekdays, 'repeat.repeatConfig.weekdays', issues) : undefined;
      if (config) ensureKeys(config, ['weekdays'], 'repeat.repeatConfig', issues);
      if (weekdays) modeForm = { repeatMode: mode, repeatConfig: { weekdays } };
    } else if (mode === RepeatMode.MONTHLY) {
      const config = parseMonthlyConfig(record.repeatConfig, 'repeat.repeatConfig', issues);
      if (config) modeForm = { repeatMode: mode, repeatConfig: config };
    } else if (mode === RepeatMode.YEARLY) {
      const config = parseYearlyConfig(record.repeatConfig, 'repeat.repeatConfig', issues);
      if (config) modeForm = { repeatMode: mode, repeatConfig: config };
    } else if (mode === RepeatMode.CUSTOM) {
      const config = parseCustomConfig(record.repeatConfig, 'repeat.repeatConfig', issues);
      if (config) modeForm = { repeatMode: mode, repeatConfig: config };
    }
  }

  let endForm: unknown;
  if (repeatEndMode && Object.values(RepeatEndMode).includes(repeatEndMode as RepeatEndMode)) {
    switch (repeatEndMode as RepeatEndMode) {
      case RepeatEndMode.FOREVER:
        if (record.repeatTimes !== undefined || record.repeatEndDate !== undefined) {
          issue(issues, 'repeat', 'unexpected_field', 'Forever rules cannot include an end date or repeat times.');
        }
        endForm = { repeatEndMode: RepeatEndMode.FOREVER };
        break;
      case RepeatEndMode.FOR_TIMES: {
        if (record.repeatEndDate !== undefined) issue(issues, 'repeat.repeatEndDate', 'unexpected_field', 'Repeat times rules cannot include an end date.');
        const repeatTimes = requireInteger(record, 'repeatTimes', 'repeat', issues, (item) => item > 0, 'Repeat times must be a positive integer.');
        if (repeatTimes !== undefined) endForm = { repeatEndMode: RepeatEndMode.FOR_TIMES, repeatTimes };
        break;
      }
      case RepeatEndMode.TO_DATE: {
        if (record.repeatTimes !== undefined) issue(issues, 'repeat.repeatTimes', 'unexpected_field', 'End date rules cannot include repeat times.');
        const repeatEndDate = requireString(record, 'repeatEndDate', 'repeat', issues);
        if (repeatEndDate && !isValidDate(repeatEndDate)) issue(issues, 'repeat.repeatEndDate', 'invalid_value', 'Expected a YYYY-MM-DD date.');
        if (repeatEndDate && isValidDate(repeatEndDate)) endForm = { repeatEndMode: RepeatEndMode.TO_DATE, repeatEndDate };
        break;
      }
    }
  }

  if (issues.length > 0 || !modeForm || !endForm) return { ok: false, issues };
  return { ok: true, value: { ...(modeForm as object), ...(endForm as object) } as RepeatSetting };
}

/** Validates the complete rule used by date algorithms, including its start date. */
export function parseRepeatRule(input: unknown): ParseResult<RepeatRule> {
  const issues: ValidationIssue[] = [];
  const record = ensureRecord(input, 'repeat', issues);
  if (!record) return { ok: false, issues };
  ensureKeys(
    record,
    ['repeatMode', 'repeatConfig', 'repeatEndMode', 'repeatTimes', 'repeatEndDate', 'repeatStartDate'],
    'repeat',
    issues
  );
  const repeatStartDate = requireString(record, 'repeatStartDate', 'repeat', issues);
  if (repeatStartDate && !isValidDate(repeatStartDate)) {
    issue(issues, 'repeat.repeatStartDate', 'invalid_value', 'Expected a YYYY-MM-DD date.');
  }
  const settingResult = parseRepeatSetting({
    repeatMode: record.repeatMode,
    repeatConfig: record.repeatConfig,
    repeatEndMode: record.repeatEndMode,
    repeatTimes: record.repeatTimes,
    repeatEndDate: record.repeatEndDate,
  });
  if (settingResult.ok === false) issues.push(...settingResult.issues);
  if (issues.length > 0 || settingResult.ok === false || !repeatStartDate || !isValidDate(repeatStartDate)) {
    return { ok: false, issues };
  }
  return { ok: true, value: { ...settingResult.value, repeatStartDate } as RepeatRule };
}

export function isRepeatSetting(value: unknown): value is RepeatSetting {
  return parseRepeatSetting(value).ok;
}

export function isRepeatRule(value: unknown): value is RepeatRule {
  return parseRepeatRule(value).ok;
}

/** Validates a complete rule without exposing its internal discriminated union. */
export function parseRepeat(input: unknown): ParseResult<RepeatPayload> {
  const parsed = parseRepeatRule(input);
  if (parsed.ok === false) return { ok: false, issues: parsed.issues };
  return { ok: true, value: parsed.value };
}

export function assertRepeat(input: unknown): RepeatPayload {
  const parsed = parseRepeat(input);
  if (parsed.ok === false) throw new RepeatValidationError(parsed.issues);
  return parsed.value;
}

export type { RepeatPayload, RepeatSettingPayload };
