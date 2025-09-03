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
  TaskModelVo,
  TaskPageFilterVo,
} from '@life-toolkit/vo/growth';
import { TaskService } from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import { TaskStatus } from '@life-toolkit/enum';

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
    taskList: TaskModelVo[];
    getTaskPage: () => Promise<void>;
    filters: TaskPageFilterVo;
    setFilters: Dispatch<SetStateAction<TaskPageFilterVo>>;
    clearFilters: () => Promise<void>;
  };
}>(() => {
  const [taskList, setTaskList] = useState<TaskModelVo[]>([]);

  const [filters, setFilters, filtersRef] = useSyncState<TaskPageFilterVo>({
    keyword: '',
    importance: undefined,
    urgency: undefined,
    status: TaskStatus.TODO,
    startAt: undefined,
    endAt: undefined,
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
      startAt: undefined,
      endAt: undefined,
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
