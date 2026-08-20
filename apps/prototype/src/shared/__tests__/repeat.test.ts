import { MonthlyType, RepeatEndMode, RepeatMode, TimeUnit, WeekDay, YearlyType, type RepeatPayload } from '@true-north/components-repeat/types';
import { firstOccurrenceOnOrAfter, nextOccurrence, settleRepeatingTodo } from '../repeat';
import type { Todo } from '../types';

const daily: RepeatPayload = {
  repeatMode: RepeatMode.DAILY,
  repeatEndMode: RepeatEndMode.FOREVER,
  repeatStartDate: '2026-07-01',
};

describe('prototype repeat scheduling', () => {
  it('finds the first and next daily occurrence', () => {
    expect(firstOccurrenceOnOrAfter('2026-07-27', daily)).toBe('2026-07-27');
    expect(nextOccurrence('2026-07-27', daily, 0)).toBe('2026-07-28');
  });

  it('uses package calendar rules for weekly, workday, monthly, yearly, and custom schedules', () => {
    const weekly: RepeatPayload = {
      repeatMode: RepeatMode.WEEKLY,
      repeatConfig: { weekdays: [WeekDay.WEDNESDAY] },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2026-07-01',
    };
    const monthly: RepeatPayload = {
      repeatMode: RepeatMode.MONTHLY,
      repeatConfig: { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: 15 },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2026-01-01',
    };
    const yearly: RepeatPayload = {
      repeatMode: RepeatMode.YEARLY,
      repeatConfig: {
        yearlyType: YearlyType.MONTH,
        [YearlyType.MONTH]: { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: 1, month: [12] },
      },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2026-01-01',
    };
    const custom: RepeatPayload = {
      repeatMode: RepeatMode.CUSTOM,
      repeatConfig: { interval: 3, intervalUnit: TimeUnit.DAY },
      repeatEndMode: RepeatEndMode.FOREVER,
      repeatStartDate: '2026-07-01',
    };

    expect(nextOccurrence('2026-07-27', weekly, 0)).toBe('2026-07-29');
    expect(firstOccurrenceOnOrAfter('2026-07-14', monthly)).toBe('2026-07-15');
    expect(nextOccurrence('2026-11-30', yearly, 0)).toBe('2026-12-01');
    expect(nextOccurrence('2026-07-27', custom, 0)).toBe('2026-07-28');
    expect(nextOccurrence('2026-07-27', { ...daily, repeatMode: RepeatMode.WORKDAYS }, 0)).toBe('2026-07-28');
  });

  it('stops a limited repeating todo after its first settled instance', () => {
    const todo: Todo = {
      id: 'repeat-1',
      title: '复盘',
      description: '',
      status: 'todo',
      importance: 3,
      urgency: 3,
      planned: '2026-07-27',
      plannedStartTime: '09:00',
      plannedEndTime: '10:00',
      repeat: { ...daily, repeatEndMode: RepeatEndMode.FOR_TIMES, repeatTimes: 1, settledTimes: 0 },
      history: [],
    };

    const settled = settleRepeatingTodo(todo, true);
    expect(settled.status).toBe('done');
    expect(settled.repeat?.settledTimes).toBe(1);
  });

  it('returns no occurrence after the rule end date', () => {
    const endingDaily: RepeatPayload = {
      ...daily,
      repeatEndMode: RepeatEndMode.TO_DATE,
      repeatEndDate: '2026-07-27',
    };

    expect(nextOccurrence('2026-07-27', endingDaily, 0)).toBeUndefined();
  });

  it('moves an overdue repeating todo to the first valid date on or after today', () => {
    const todo: Todo = {
      id: 'repeat-2',
      title: '阅读',
      description: '',
      status: 'todo',
      importance: 3,
      urgency: 3,
      planned: '2026-07-24',
      plannedStartTime: '09:00',
      plannedEndTime: '10:00',
      repeat: { ...daily, settledTimes: 0 },
      history: [],
    };

    const settled = settleRepeatingTodo(todo, false, '2026-07-27');
    expect(settled.status).toBe('todo');
    expect(settled.planned).toBe('2026-07-27');
    expect(settled.repeat?.settledTimes).toBe(1);
  });
});
