import {
  MonthlyType,
  RepeatEndMode,
  RepeatMode,
  TimeUnit,
  WeekDay,
} from '../src/types';
import { calculateNextDate, parseRepeat } from '../src/helpers';
import { parseRepeatSetting } from '../src/core';
import dayjs from 'dayjs';

describe('repeat payload parser', () => {
  const weeklyRule = {
    repeatMode: RepeatMode.WEEKLY,
    repeatConfig: { weekdays: [WeekDay.MONDAY, WeekDay.WEDNESDAY] },
    repeatEndMode: RepeatEndMode.FOREVER,
    repeatStartDate: '2024-01-01',
  };

  it('accepts an opaque payload and narrows it before calculation', () => {
    const parsed = parseRepeat(weeklyRule);
    expect(parsed.ok).toBe(true);

    const nextDate = calculateNextDate(dayjs('2024-01-01'), weeklyRule);
    expect(nextDate).toEqual(expect.objectContaining({ ok: true }));
    if (nextDate.ok) expect(nextDate.value?.format('YYYY-MM-DD')).toBe('2024-01-03');
  });

  it('rejects a config whose structure does not match its mode', () => {
    const parsed = parseRepeat({
      ...weeklyRule,
      repeatConfig: { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: 1 },
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok === false) expect(parsed.issues.some((item) => item.path.includes('weekdays'))).toBe(true);
  });

  it('rejects invalid nested values and end-condition fields', () => {
    const parsed = parseRepeat({
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: {
        interval: 0,
        intervalUnit: TimeUnit.WEEK,
        [TimeUnit.WEEK]: { weekdays: [0] },
      },
      repeatEndMode: RepeatEndMode.FOR_TIMES,
      repeatTimes: 0,
      repeatEndDate: '2024-01-01',
      repeatStartDate: '2024-02-30',
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok === false) {
      expect(parsed.issues.map((item) => item.path)).toEqual(
        expect.arrayContaining([
          'repeat.repeatConfig.interval',
          'repeat.repeatConfig.week.weekdays',
          'repeat.repeatTimes',
          'repeat.repeatEndDate',
          'repeat.repeatStartDate',
        ])
      );
    }
  });

  it('validates selector settings without requiring a start date', () => {
    const parsed = parseRepeatSetting({
      repeatMode: RepeatMode.DAILY,
      repeatEndMode: RepeatEndMode.TO_DATE,
      repeatEndDate: '2024-12-31',
    });
    expect(parsed.ok).toBe(true);
  });

  it('accepts NULL optional fields from persisted normal-mode rules', () => {
    const parsed = parseRepeat({
      repeatMode: RepeatMode.WEEKDAYS,
      repeatConfig: null,
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatEndDate: null,
      repeatTimes: null,
      repeatStartDate: '2025-09-21',
    });
    expect(parsed.ok).toBe(true);
  });
});
