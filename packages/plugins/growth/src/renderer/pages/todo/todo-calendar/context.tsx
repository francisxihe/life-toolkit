import { createInjectState } from '@/utils/createInjectState';
import { useCallback, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { TodoService } from '@true-north/web-service';
import { TodoVo } from '@true-north/vo';

export const [CalendarProvider, useCalendarContext] = createInjectState<{
  ContextType: {
    todoList: TodoVo[];
    searchQuery: string;
    pageShowDate: Dayjs;
    addDate: Dayjs | null;
    setSearchQuery: (query: string) => void;
    setPageShowDate: (date: Dayjs) => void;
    setAddDate: (date: Dayjs | null) => void;
    getTodoList: (date?: Dayjs) => Promise<void>;
  };
}>(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [todoList, setTodoList] = useState<TodoVo[]>([]);
  const [pageShowDate, setPageShowDate] = useState(dayjs());

  const getTodoList = useCallback(async (date = pageShowDate) => {
    const visibleStart = date.startOf('month').startOf('week');
    const visibleEnd = date.endOf('month').endOf('week');
    const response = await TodoService.list({
      planDateStart: visibleStart.format('YYYY-MM-DD'),
      planDateEnd: visibleEnd.format('YYYY-MM-DD'),
    });
    setTodoList(response?.list ?? []);
  }, [pageShowDate]);

  const [addDate, setAddDate] = useState<Dayjs | null>(null);

  return {
    todoList,
    searchQuery,
    pageShowDate,
    addDate,
    setSearchQuery,
    setPageShowDate,
    getTodoList,
    setAddDate,
  };
});
