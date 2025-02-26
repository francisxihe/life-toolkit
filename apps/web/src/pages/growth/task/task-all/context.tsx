'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useRef,
  useEffect,
} from 'react';
import { TaskVo, TaskPageFiltersVo, TaskStatus } from '@life-toolkit/vo/task';
import TaskService from '../service';
import { createInjectState } from '@/utils/createInjectState';

function useSyncState<T>(
  initialValue: T,
): [T, (newValue: T) => void, React.MutableRefObject<T>] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(state);

  const setSyncState = (newValue: T) => {
    setState(newValue);
    stateRef.current = newValue;
  };

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, setSyncState, stateRef];
}

export const [TaskAllProvider, useTaskAllContext] = createInjectState<{
  ContextType: {
    taskList: TaskVo[];
    getTaskPage: () => Promise<void>;
    filters: TaskPageFiltersVo;
    setFilters: Dispatch<SetStateAction<TaskPageFiltersVo>>;
    clearFilters: () => Promise<void>;
  };
}>(() => {
  const [taskList, setTaskList] = useState<TaskVo[]>([]);

  const [filters, setFilters, filtersRef] = useSyncState<TaskPageFiltersVo>({
    keyword: '',
    importance: undefined,
    urgency: undefined,
    status: TaskStatus.TODO,
    planDateStart: undefined,
    planDateEnd: undefined,
    doneDateStart: undefined,
    doneDateEnd: undefined,
    abandonedDateStart: undefined,
    abandonedDateEnd: undefined,
    tags: [],
  });

  async function getTaskPage() {
    const { list, total } = await TaskService.getTaskPage(filtersRef.current);
    setTaskList(list);
  }

  const clearFilters = async () => {
    setFilters({
      keyword: '',
      importance: undefined,
      urgency: undefined,
      status: undefined,
      planDateStart: undefined,
      planDateEnd: undefined,
      doneDateStart: undefined,
      doneDateEnd: undefined,
      abandonedDateStart: undefined,
      abandonedDateEnd: undefined,
      tags: [],
    });
    await getTaskPage();
  };

  return { taskList, getTaskPage, filters, setFilters, clearFilters };
});
