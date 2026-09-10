import { Importance, Difficulty, Urgency } from '@true-north/enum';

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
      color: 'green',
      label: '略有裨益',
    },
  ],
  [
    Importance.Core,
    {
      color: 'blue',
      label: '重要',
    },
  ],
  [
    Importance.Key,
    {
      color: 'orange',
      label: '举足轻重',
    },
  ],
  [
    Importance.Essential,
    {
      color: 'red',
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
      color: 'green',
      label: '略费手脚',
    },
  ],
  [
    Difficulty.Challenger,
    {
      color: 'blue',
      label: '颇费周章',
    },
  ],
  [
    Difficulty.Master,
    {
      color: 'orange',
      label: '千回百转',
    },
  ],
  [
    Difficulty.Legendary,
    {
      color: 'red',
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
      color: 'green',
      label: '按部就班',
    },
  ],
  [
    Urgency.Soon,
    {
      color: 'blue',
      label: '事不宜迟',
    },
  ],
  [
    Urgency.Now,
    {
      color: 'orange',
      label: '刻不容缓',
    },
  ],
  [
    Urgency.ASAP,
    {
      color: 'red',
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
