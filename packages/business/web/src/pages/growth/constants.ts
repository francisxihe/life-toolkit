import { Importance, Difficulty, Urgency } from '@life-toolkit/enum';

export const IMPORTANCE_MAP = new Map([
  [
    Importance.Supplementary,
    {
      color: 'gray',
      label: '聊胜于无',
    },
  ],
  [
    Importance.Helpful,
    {
      color: 'success',
      label: '略有裨益',
    },
  ],
  [
    Importance.Core,
    {
      color: 'primary',
      label: '重要',
    },
  ],
  [
    Importance.Key,
    {
      color: 'warning',
      label: '举足轻重',
    },
  ],
  [
    Importance.Essential,
    {
      color: 'danger',
      label: '不容或缺',
    },
  ],
]);

export const DIFFICULTY_MAP = new Map([
  [
    Difficulty.GettingStarted,
    {
      color: 'gray',
      label: '轻而易举',
    },
  ],
  [
    Difficulty.Skilled,
    {
      color: 'success',
      label: '略费手脚',
    },
  ],
  [
    Difficulty.Challenger,
    {
      color: 'primary',
      label: '颇费周章',
    },
  ],
  [
    Difficulty.Master,
    {
      color: 'warning',
      label: '千回百转',
    },
  ],
  [
    Difficulty.Legendary,
    {
      color: 'danger',
      label: '登峰造极',
    },
  ],
]);

export const URGENCY_MAP = new Map([
  [
    Urgency.Someday,
    {
      color: 'gray',
      label: '来日方长',
    },
  ],
  [
    Urgency.Later,
    {
      color: 'success',
      label: '按部就班',
    },
  ],
  [
    Urgency.Soon,
    {
      color: 'primary',
      label: '事不宜迟',
    },
  ],
  [
    Urgency.Now,
    {
      color: 'warning',
      label: '刻不容缓',
    },
  ],
  [
    Urgency.ASAP,
    {
      color: 'danger',
      label: '十万火急',
    },
  ],
  [
    null,
    {
      color: 'text-3',
      label: '无',
    },
  ],
]);
