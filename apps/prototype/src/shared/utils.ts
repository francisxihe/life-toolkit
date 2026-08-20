import type { Goal, Todo } from './types';
import { RepeatEndMode, RepeatMode, type RepeatPayload } from '@true-north/components-repeat/types';

export type ExecutionScope = 'today' | 'week';
export type ExecutionGroupKey = 'overdue' | 'current' | 'done' | 'abandoned';
export type ExecutionItem = { status: string };
export type ExecutionGroup<T> = {
  key: ExecutionGroupKey;
  title: string;
  items: T[];
};

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function dateOf(value: string) {
  return new Date(`${value}T12:00:00`);
}
export function addDays(value: string, amount: number) {
  const date = dateOf(value);
  date.setDate(date.getDate() + amount);
  return iso(date);
}
export function daysBetween(start: string, end: string) {
  return Math.round((dateOf(end).getTime() - dateOf(start).getTime()) / 86400000);
}
export function getExecutionRange(scope: ExecutionScope, today: string) {
  if (scope === 'today') return { start: today, end: today, label: '未完成' };

  const start = addDays(today, -dateOf(today).getDay());
  return { start, end: addDays(start, 6), label: '未完成' };
}
export function groupExecutionItems<T extends ExecutionItem>(
  items: T[],
  scope: ExecutionScope,
  today: string,
  getTimeRange: (item: T) => { start: string; end: string },
  options?: { includeOverdue?: boolean },
): ExecutionGroup<T>[] {
  const { start, end, label } = getExecutionRange(scope, today);
  const includeOverdue = options?.includeOverdue !== false;
  const pending = (item: T) => item.status !== 'done' && item.status !== 'abandoned';
  const inRange = (item: T) => {
    const range = getTimeRange(item);
    return range.start <= end && range.end >= start;
  };
  const isOverdue = (item: T) => getTimeRange(item).end < start;

  return [
    {
      key: 'overdue',
      title: '已过期',
      items: includeOverdue ? items.filter((item) => pending(item) && isOverdue(item)) : [],
    },
    { key: 'current', title: label, items: items.filter((item) => pending(item) && inRange(item)) },
    { key: 'done', title: '已完成', items: items.filter((item) => item.status === 'done' && inRange(item)) },
    { key: 'abandoned', title: '已放弃', items: items.filter((item) => item.status === 'abandoned' && inRange(item)) },
  ];
}
export function statusLabel(status: string) {
  return (
    (
      {
        todo: '待开始',
        doing: '进行中',
        done: '已完成',
        paused: '已暂停',
        archived: '已归档',
        abandoned: '已放弃',
        active: '开始',
        completed: '已完成',
      } as Record<string, string>
    )[status] || status
  );
}
/** 计划起止不相等时为时间区间，可从待办入口管理专注计时 */
export function isTodoPlanRange(todo: Pick<Todo, 'plannedStartTime' | 'plannedEndTime'>) {
  return Boolean(todo.plannedStartTime && todo.plannedEndTime && todo.plannedStartTime !== todo.plannedEndTime);
}
export function canFocusTodo(todo: Pick<Todo, 'status' | 'plannedStartTime' | 'plannedEndTime'>) {
  return todo.status === 'todo' && isTodoPlanRange(todo);
}
export function formatTodoPlan(todo: Pick<Todo, 'planned' | 'plannedStartTime' | 'plannedEndTime'>) {
  const time = todo.plannedStartTime === todo.plannedEndTime
    ? todo.plannedStartTime
    : `${todo.plannedStartTime}-${todo.plannedEndTime}`;
  return `${todo.planned} ${time}`;
}
export function compareTodoPlan(left: Todo, right: Todo) {
  return `${left.planned} ${left.plannedStartTime}`.localeCompare(`${right.planned} ${right.plannedStartTime}`);
}
export function goalName(goals: Goal[], id?: string) {
  return goals.find((goal) => goal.id === id)?.title || '独立事项';
}
export function repeatLabel(repeat: RepeatPayload) {
  const mode = {
    [RepeatMode.DAILY]: '每天',
    [RepeatMode.WEEKLY]: '每周',
    [RepeatMode.MONTHLY]: '每月',
    [RepeatMode.YEARLY]: '每年',
    [RepeatMode.WEEKDAYS]: '工作日',
    [RepeatMode.WEEKEND]: '周末',
    [RepeatMode.WORKDAYS]: '法定工作日',
    [RepeatMode.REST_DAY]: '法定休息日',
    [RepeatMode.CUSTOM]: '自定义周期',
    [RepeatMode.NONE]: '不重复',
  }[repeat.repeatMode];
  if (repeat.repeatEndMode === RepeatEndMode.FOR_TIMES) return `${mode}，共 ${repeat.repeatTimes} 次`;
  if (repeat.repeatEndMode === RepeatEndMode.TO_DATE) return `${mode}，至 ${repeat.repeatEndDate}`;
  return mode;
}
