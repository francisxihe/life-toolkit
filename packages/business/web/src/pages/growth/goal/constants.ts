import { GoalImportance, GoalDifficulty } from '@life-toolkit/enum';

export const IMPORTANCE_MAP = new Map([
  [
    GoalImportance.Supplementary,
    {
      color: 'gray',
      label: '聊胜于无',
    },
  ],
  [
    GoalImportance.Helpful,
    {
      color: 'success',
      label: '略有裨益',
    },
  ],
  [
    GoalImportance.Core,
    {
      color: 'primary',
      label: '重要',
    },
  ],
  [
    GoalImportance.Key,
    {
      color: 'warning',
      label: '举足轻重',
    },
  ],
  [
    GoalImportance.Essential,
    {
      color: 'danger',
      label: '不容或缺',
    },
  ],
]);

export const DIFFICULTY_MAP = new Map([
  [
    GoalDifficulty.GettingStarted,
    {
      color: 'gray',
      label: '轻而易举',
    },
  ],
  [
    GoalDifficulty.Skilled,
    {
      color: 'success',
      label: '略费手脚',
    },
  ],
  [
    GoalDifficulty.Challenger,
    {
      color: 'primary',
      label: '颇费周章',
    },
  ],
  [
    GoalDifficulty.Master,
    {
      color: 'warning',
      label: '千回百转',
    },
  ],
  [
    GoalDifficulty.Legendary,
    {
      color: 'danger',
      label: '登峰造极',
    },
  ],
]);
