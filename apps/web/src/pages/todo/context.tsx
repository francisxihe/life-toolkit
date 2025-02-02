'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';
import { Todo } from './service/types';
import TodoService from './service/api';
import { GetTodoListParams } from './service/types';

interface TodoContextType {
  todoList: Todo[];
  loadTodoList: (params?: GetTodoListParams) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todoList, setTodoList] = useState<Todo[]>([]);

  async function loadTodoList(params?: GetTodoListParams) {
    const todoList = await TodoService.getTodoList(params);
    setTodoList(todoList);
  }

  return (
    <TodoContext.Provider
      value={{
        todoList,
        loadTodoList,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
