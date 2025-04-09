export const IMPORTANCE_MAP = new Map([
  [
    1,
    {
      color: 'danger',
      label: '非常重要',
    },
  ],
  [
    2,
    {
      color: 'warning',
      label: '重要',
    },
  ],
  [
    3,
    {
      color: 'success',
      label: '一般',
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

export const URGENCY_MAP = new Map([
  [
    1,
    {
      color: 'danger',
      label: '非常紧急',
    },
  ],
  [
    2,
    {
      color: 'warning',
      label: '紧急',
    },
  ],
  [
    3,
    {
      color: 'success',
      label: '一般',
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

export function getPriorityQuadrant(
  importance: string,
  urgency: string,
): string {
  if (importance === 'high' && urgency === 'high') return '紧急且重要';
  if (importance === 'high' && urgency !== 'high') return '重要';
  if (importance !== 'high' && urgency === 'high') return '紧急';
  return '常规';
}
