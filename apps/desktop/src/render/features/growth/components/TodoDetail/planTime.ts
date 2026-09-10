import dayjs, { type Dayjs } from 'dayjs';

export const DEFAULT_PLAN_TIME = '09:00';

/** 将 DB/表单时间规范为 HH:mm */
export function toHm(value?: string): string | undefined {
  if (!value) return undefined;
  const [hour, minute] = value.split(':');
  if (hour === undefined || minute === undefined) return undefined;
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

export function toDayjsTime(value?: string): Dayjs | undefined {
  const hm = toHm(value);
  if (!hm) return undefined;
  const [hour, minute] = hm.split(':').map(Number);
  return dayjs().hour(hour).minute(minute).second(0).millisecond(0);
}

export function toTimeMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

export function timeFromMinutes(value: number): string {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function defaultTimeRange(point: string): { start: string; end: string } {
  const latest = 23 * 60 + 55;
  const start = toTimeMinutes(point);
  const end = Math.min(start + 60, latest);
  if (end > start) return { start: point, end: timeFromMinutes(end) };
  return { start: timeFromMinutes(latest - 60), end: timeFromMinutes(latest) };
}

/** start === end → 时间点；否则显示区间 */
export function formatTodoPlanTime(start?: string, end?: string): string {
  const startHm = toHm(start);
  const endHm = toHm(end);
  if (!startHm || !endHm) return '';
  return startHm === endHm ? startHm : `${startHm}-${endHm}`;
}

/** 计划起止不相等时为时间区间，可从待办入口管理专注计时 */
export function isTodoPlanRange(start?: string, end?: string): boolean {
  const startHm = toHm(start);
  const endHm = toHm(end);
  return Boolean(startHm && endHm && startHm !== endHm);
}

export function normalizePlanTimeRange(
  range?: [string | undefined, string | undefined] | null,
): [string, string] {
  const start = toHm(range?.[0]) || DEFAULT_PLAN_TIME;
  const end = toHm(range?.[1]) || start;
  return [start, end];
}
