import { HabitStatus, Difficulty } from '@true-north/enum';

export const HABIT_STATUS_OPTIONS = [
  {
    label: '活跃中',
    value: HabitStatus.ACTIVE,
    color: 'green',
  },
  {
    label: '已暂停',
    value: HabitStatus.PAUSED,
    color: 'orange',
  },
  {
    label: '已完成',
    value: HabitStatus.COMPLETED,
    color: 'blue',
  },
  {
    label: '已放弃',
    value: HabitStatus.ABANDONED,
    color: 'red',
  },
];
export const HABIT_DIFFICULTY_OPTIONS = [
  {
    label: '容易',
    value: Difficulty.GettingStarted,
    color: 'green',
  },
  {
    label: '中等',
    value: Difficulty.Challenger,
    color: 'orange',
  },
  {
    label: '困难',
    value: Difficulty.Legendary,
    color: 'red',
  },
];

export const COMPLETION_SCORE_OPTIONS = [
  {
    label: '未完成',
    value: 0,
    color: 'red',
  },
  {
    label: '部分完成',
    value: 1,
    color: 'orange',
  },
  {
    label: '完全完成',
    value: 2,
    color: 'green',
  },
];

export const MOOD_OPTIONS = [
  {
    label: '很差',
    value: 1,
    icon: '😞',
  },
  {
    label: '较差',
    value: 2,
    icon: '😕',
  },
  {
    label: '一般',
    value: 3,
    icon: '😐',
  },
  {
    label: '良好',
    value: 4,
    icon: '🙂',
  },
  {
    label: '很好',
    value: 5,
    icon: '😄',
  },
];
