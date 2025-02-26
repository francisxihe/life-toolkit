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
import { TodoVo, TodoPageFiltersVo } from '@life-toolkit/vo/todo';
import TodoService from '../service';
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

export const [TodoAllProvider, useTodoAllContext] = createInjectState<{
  ContextType: {
    todoList: TodoVo[];
    getTodoPage: () => Promise<void>;
    filters: TodoPageFiltersVo;
    setFilters: Dispatch<SetStateAction<TodoPageFiltersVo>>;
    clearFilters: () => Promise<void>;
  };
}>(() => {
  const [todoList, setTodoList] = useState<TodoVo[]>([]);

  const [filters, setFilters, filtersRef] = useSyncState<TodoPageFiltersVo>({
    keyword: '',
    importance: undefined,
    urgency: undefined,
    status: 'todo',
    planDateStart: undefined,
    planDateEnd: undefined,
    doneDateStart: undefined,
    doneDateEnd: undefined,
    abandonedDateStart: undefined,
    abandonedDateEnd: undefined,
    tags: [],
  });

  async function getTodoPage() {
    const { list, total } = await TodoService.getTodoPage(filtersRef.current);
    setTodoList(list);
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
    await getTodoPage();
  };

  return { todoList, getTodoPage, filters, setFilters, clearFilters };
});
