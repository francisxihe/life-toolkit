'use client';

import { createInjectState } from '@/utils/createInjectState';
import dayjs from 'dayjs';
export const [TodoProvider, useTodoContext] = createInjectState<{
  ContextType: {
    today: string;
    yesterday: string;
    weekStart: string;
    weekEnd: string;
  };
}>(() => {
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
  const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');

  console.log('weekStart', dayjs().startOf('week'));
  console.log('weekStart', weekStart);
  console.log('weekEnd', weekEnd);

  return {
    today,
    yesterday,
    weekStart,
    weekEnd,
  };
});
