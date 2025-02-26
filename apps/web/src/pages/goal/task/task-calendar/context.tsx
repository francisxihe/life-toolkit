import { createInjectState } from '@/utils/createInjectState';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import ApiService from '../service';
import { TaskVo } from '@life-toolkit/vo/task';

export const [CalendarProvider, useCalendarContext] = createInjectState<{
  ContextType: {
    taskList: TaskVo[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    pageShowDate: Dayjs;
    setPageShowDate: (date: Dayjs) => void;
    move: (date: Dayjs) => void;
    changePageShowDate: (type: 'prev' | 'next', mode: 'month' | 'year') => void;
    calendarMode: 'month' | 'year';
    setCalendarMode: (mode: 'month' | 'year') => void;
    getTaskList: () => Promise<void>;
  };
}>(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [taskList, setTaskList] = useState<TaskVo[]>([]);
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

  const getTaskList = async () => {
    const { list } = await ApiService.getTaskList();
    setTaskList(list);
  };

  useEffect(() => {
    getTaskList();
  }, []);

  return {
    taskList,
    searchQuery,
    setSearchQuery,
    pageShowDate,
    setPageShowDate,
    move,
    changePageShowDate,
    calendarMode,
    setCalendarMode,
    getTaskList,
  };
});
