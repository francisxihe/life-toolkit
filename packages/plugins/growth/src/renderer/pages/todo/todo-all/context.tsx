'use client';

import { useState, Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { TodoVo, TodoPageFilterVo } from '@true-north/vo';
import { TodoService } from '@true-north/web-service';
import { createInjectState } from '@/utils/createInjectState';
import { TodoStatus } from '@true-north/enum';

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
    filters: TodoPageFilterVo;
    setFilters: Dispatch<SetStateAction<TodoPageFilterVo>>;
    clearFilters: () => Promise<void>;
  };
}>(() => {
  const [todoList, setTodoList] = useState<TodoVo[]>([]);

  const [filters, setFilters, filtersRef] = useSyncState<TodoPageFilterVo>({
    keyword: '',
    importance: undefined,
    urgency: undefined,
    status: TodoStatus.TODO,
    planDateStart: undefined,
    planDateEnd: undefined,
    doneDateStart: undefined,
    doneDateEnd: undefined,
    abandonedDateStart: undefined,
    abandonedDateEnd: undefined,
    pageNum: 1,
    pageSize: 10,
  });

  async function getTodoPage() {
    const { list, total } = await TodoService.page(filtersRef.current);
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
      pageNum: 1,
      pageSize: 10,
    });
    await getTodoPage();
  };

  return { todoList, getTodoPage, filters, setFilters, clearFilters };
});
