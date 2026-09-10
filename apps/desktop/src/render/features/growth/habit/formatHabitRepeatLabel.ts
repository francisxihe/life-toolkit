import { HabitWithoutRelationsVo } from '@true-north/vo';
import { RepeatEndMode, RepeatMode } from '@true-north/components-repeat/types';

const MODE_LABEL: Record<RepeatMode, string> = {
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
};

export function formatHabitRepeatLabel(
  habit: Pick<HabitWithoutRelationsVo, 'repeatMode' | 'repeatEndMode' | 'repeatTimes' | 'repeatEndDate'>,
) {
  const mode = MODE_LABEL[habit.repeatMode] || '重复';
  if (habit.repeatEndMode === RepeatEndMode.FOR_TIMES) {
    return `${mode}，共 ${habit.repeatTimes || 0} 次`;
  }
  if (habit.repeatEndMode === RepeatEndMode.TO_DATE && habit.repeatEndDate) {
    return `${mode}，至 ${habit.repeatEndDate}`;
  }
  return mode;
}
