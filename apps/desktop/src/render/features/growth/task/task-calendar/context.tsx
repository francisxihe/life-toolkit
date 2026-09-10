import { createInjectState } from '@/utils/createInjectState';
import { useCallback, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { TaskService } from '@true-north/web-service';
import { TaskVo } from '@true-north/vo';

export const [CalendarProvider, useCalendarContext] = createInjectState<{
  ContextType: {
    taskList: TaskVo[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    pageShowDate: Dayjs;
    setPageShowDate: (date: Dayjs) => void;
    showAddTaskDate: Dayjs | null;
    setShowAddTaskDate: (date: Dayjs | null) => void;
    getTaskList: (date?: Dayjs) => Promise<void>;
  };
}>(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [taskList, setTaskList] = useState<TaskVo[]>([]);
  const [pageShowDate, setPageShowDate] = useState(dayjs());
  const [showAddTaskDate, setShowAddTaskDate] = useState<Dayjs | null>(null);

  const getTaskList = useCallback(async (date = pageShowDate) => {
    const visibleStart = date.startOf('month').startOf('week');
    const visibleEnd = date.endOf('month').endOf('week');
    const response = await TaskService.findByFilter({
      startDateEnd: visibleEnd.format('YYYY-MM-DD'),
      endDateStart: visibleStart.format('YYYY-MM-DD'),
    });
    setTaskList(response?.list ?? []);
  }, [pageShowDate]);

  return {
    taskList,
    searchQuery,
    setSearchQuery,
    pageShowDate,
    setPageShowDate,
    showAddTaskDate,
    setShowAddTaskDate,
    getTaskList,
  };
});
