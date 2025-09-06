import { createInjectState } from '@/utils/createInjectState';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { TodoService } from '../../service';
import { TodoVo } from '@life-toolkit/vo/growth';

export const [CalendarProvider, useCalendarContext] = createInjectState<{
  ContextType: {
    todoList: TodoVo[];
    searchQuery: string;
    calendarMode: 'month' | 'year';
    pageShowDate: Dayjs;
    showAddTaskDate: Dayjs | null;
    setSearchQuery: (query: string) => void;
    setPageShowDate: (date: Dayjs) => void;
    move: (date: Dayjs) => void;
    changePageShowDate: (type: 'prev' | 'next', mode: 'month' | 'year') => void;
    setShowAddTaskDate: (date: Dayjs | null) => void;
    setCalendarMode: (mode: 'month' | 'year') => void;
    getTodoList: () => Promise<void>;
  };
}>(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [todoList, setTodoList] = useState<TodoVo[]>([]);
  const [pageShowDate, setPageShowDate] = useState(dayjs());
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month');

  function onChangePageDate(time: Dayjs) {
    setPageShowDate(time);
    // onPanelChange && onPanelChange(time);
  }

  function move(time: Dayjs) {
    // setCalendarDate(time);
    // onChange && onChange(time);
    onChangePageDate(time);
  }

  function changePageShowDate(type: 'prev' | 'next', mode: 'month' | 'year') {
    if (type === 'prev') {
      setPageShowDate(dayjs(pageShowDate).subtract(1, mode));
    } else {
      setPageShowDate(dayjs(pageShowDate).add(1, mode));
    }
  }

  const getTodoList = async () => {
    const { list } = await TodoService.getTodoListWithRepeat();
    setTodoList(list);
  };

  useEffect(() => {
    getTodoList();
  }, []);

  const [showAddTaskDate, setShowAddTaskDate] = useState<Dayjs | null>(null);

  return {
    todoList,
    searchQuery,
    calendarMode,
    pageShowDate,
    showAddTaskDate,
    setSearchQuery,
    setPageShowDate,
    move,
    changePageShowDate,
    setCalendarMode,
    getTodoList,
    setShowAddTaskDate,
  };
});
