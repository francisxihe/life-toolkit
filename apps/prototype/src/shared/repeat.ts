import dayjs from 'dayjs';
import { calculateNextDate, isValidDate } from '@true-north/components-repeat/helpers';
import { RepeatEndMode, RepeatMode, type RepeatPayload } from '@true-north/components-repeat/types';
import type { Todo, TodoRepeat } from './types';

function toRepeatPayload(repeat: RepeatPayload | TodoRepeat): RepeatPayload {
  return {
    repeatMode: repeat.repeatMode,
    repeatConfig: repeat.repeatConfig,
    repeatEndMode: repeat.repeatEndMode,
    repeatTimes: repeat.repeatTimes,
    repeatEndDate: repeat.repeatEndDate,
    repeatStartDate: repeat.repeatStartDate,
  };
}

export function isRepeating(repeat?: RepeatPayload): boolean {
  return Boolean(repeat && repeat.repeatMode !== RepeatMode.NONE);
}

function isExhausted(repeat: RepeatPayload, settledTimes: number): boolean {
  return repeat.repeatEndMode === RepeatEndMode.FOR_TIMES && settledTimes >= (repeat.repeatTimes || 0);
}

function validDate(value: string, repeat: RepeatPayload): boolean {
  const result = isValidDate(dayjs(value), repeat);
  if (result.ok === false) throw new Error(result.issues.map((issue) => issue.message).join('；'));
  return result.value;
}

function calculateAfter(value: string, repeat: RepeatPayload): string | undefined {
  const result = calculateNextDate(dayjs(value), repeat);
  if (result.ok === false) throw new Error(result.issues.map((issue) => issue.message).join('；'));
  return result.value?.format('YYYY-MM-DD');
}

export function firstOccurrenceOnOrAfter(from: string, repeat: RepeatPayload, settledTimes = 0): string | undefined {
  if (!isRepeating(repeat) || isExhausted(repeat, settledTimes)) return undefined;
  const candidate = dayjs(from).isBefore(dayjs(repeat.repeatStartDate), 'day')
    ? dayjs(repeat.repeatStartDate)
    : dayjs(from);
  for (let offset = 0; offset <= 732; offset += 1) {
    const date = candidate.add(offset, 'day').format('YYYY-MM-DD');
    if (validDate(date, repeat)) return date;
  }
  return undefined;
}

export function nextOccurrence(after: string, repeat: RepeatPayload, settledTimes: number): string | undefined {
  if (!isRepeating(repeat) || isExhausted(repeat, settledTimes)) return undefined;
  const next = calculateAfter(after, repeat);
  if (next && validDate(next, repeat)) return next;
  return firstOccurrenceOnOrAfter(dayjs(after).add(1, 'day').format('YYYY-MM-DD'), repeat, settledTimes);
}

export function settleRepeatingTodo(todo: Todo, completed: boolean, nextOnOrAfter?: string): Todo {
  if (!todo.repeat) return { ...todo, status: completed ? 'done' : 'abandoned' };
  const repeat = toRepeatPayload(todo.repeat);
  const settledTimes = todo.repeat.settledTimes + 1;
  const nextDate = nextOnOrAfter
    ? firstOccurrenceOnOrAfter(nextOnOrAfter, repeat, settledTimes)
    : nextOccurrence(todo.planned, repeat, settledTimes);
  const event = completed ? '完成周期待办' : '标记周期待办未完成';
  if (!nextDate) {
    return {
      ...todo,
      status: completed ? 'done' : 'abandoned',
      repeat: { ...todo.repeat, settledTimes },
      history: [...todo.history, `${todo.planned} ${event}，重复计划已结束`],
    };
  }
  return {
    ...todo,
    status: 'todo',
    planned: nextDate,
    repeat: { ...todo.repeat, settledTimes },
    history: [...todo.history, `${todo.planned} ${event}，已安排 ${nextDate}`],
  };
}

export function asTodoRepeat(value: RepeatPayload, settledTimes = 0): TodoRepeat {
  return { ...value, settledTimes };
}
