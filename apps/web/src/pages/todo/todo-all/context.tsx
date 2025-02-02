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
import { Todo } from '../service/types';
import TodoService from '../service/api';
import { TodoFilters } from '../types';
import { createInjectState } from '@/utils/createInjectState';

function useSyncState<T>(
  initialValue: T
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
  todoList: Todo[];
  getTodoPage: () => Promise<void>;
  filters: TodoFilters;
  setFilters: Dispatch<SetStateAction<TodoFilters>>;
  clearFilters: () => Promise<void>;
}>(() => {
  const [todoList, setTodoList] = useState<Todo[]>([]);

  const [filters, setFilters, filtersRef] = useSyncState<TodoFilters>({
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
    const { records, total } = await TodoService.getTodoPage(
      filtersRef.current
    );
    setTodoList(records);
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
