'use client';

import {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useRef,
  useEffect,
} from 'react';
import {
  TaskVo,
  TaskWithoutRelationsVo,
  TaskPageFilterVo,
} from '@true-north/vo';
import { TaskService } from '@true-north/web-service';
import { createInjectState } from '@/utils/createInjectState';
import { TaskStatus } from '@true-north/enum';

function useSyncState<T>(
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>, React.MutableRefObject<T>] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(state);

  const setSyncState: Dispatch<SetStateAction<T>> = (nextValue) => {
    const newValue = typeof nextValue === 'function'
      ? (nextValue as (previousValue: T) => T)(stateRef.current)
      : nextValue;
    stateRef.current = newValue;
    setState(newValue);
  };

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, setSyncState, stateRef];
}

export const [TaskAllProvider, useTaskAllContext] = createInjectState<{
  ContextType: {
    taskList: TaskWithoutRelationsVo[];
    total: number;
    loading: boolean;
    getTaskPage: () => Promise<void>;
    filters: TaskPageFilterVo;
    setFilters: Dispatch<SetStateAction<TaskPageFilterVo>>;
    setPage: (pageNum: number, pageSize?: number) => void;
    clearFilters: () => Promise<void>;
  };
}>(() => {
  const [taskList, setTaskList] = useState<TaskWithoutRelationsVo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFiltersState, filtersRef] = useSyncState<TaskPageFilterVo>({
    keyword: '',
    importance: undefined,
    urgency: undefined,
    status: undefined,
    startDateStart: undefined,
    startDateEnd: undefined,
    endDateStart: undefined,
    endDateEnd: undefined,
    doneDateStart: undefined,
    doneDateEnd: undefined,
    abandonedDateStart: undefined,
    abandonedDateEnd: undefined,
    pageNum: 1,
    pageSize: 10,
  });

  const getTaskPage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await TaskService.page(filtersRef.current);
      setTaskList(response?.list ?? []);
      setTotal(response?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  const setFilters: Dispatch<SetStateAction<TaskPageFilterVo>> = (nextFilters) => {
    setFiltersState((currentFilters) => ({
      ...(typeof nextFilters === 'function'
        ? nextFilters(currentFilters)
        : nextFilters),
      pageNum: 1,
    }));
  };

  const setPage = (pageNum: number, pageSize = filtersRef.current.pageSize) => {
    setFiltersState((currentFilters) => ({
      ...currentFilters,
      pageNum,
      pageSize,
    }));
  };

  const clearFilters = async () => {
    setFiltersState({
      keyword: '',
      importance: undefined,
      urgency: undefined,
      status: undefined,
      startDateStart: undefined,
      startDateEnd: undefined,
      endDateStart: undefined,
      endDateEnd: undefined,
      doneDateStart: undefined,
      doneDateEnd: undefined,
      abandonedDateStart: undefined,
      abandonedDateEnd: undefined,
      pageNum: 1,
      pageSize: 10,
    });
    await getTaskPage();
  };

  return {
    taskList,
    total,
    loading,
    getTaskPage,
    filters,
    setFilters,
    setPage,
    clearFilters,
  };
});
