'use client';

import { createContext, useContext, useState } from 'react';
import { TodoVo, TodoListFiltersVo } from '@life-toolkit/vo/todo';
import TodoService from '../service';

interface TodoContextType {
  todoList: TodoVo[];
  loadTodoList: (params?: TodoListFiltersVo) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todoList, setTodoList] = useState<TodoVo[]>([]);

  async function loadTodoList(params?: TodoListFiltersVo) {
    const res = await TodoService.getTodoList(params);
    setTodoList(res.list);
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
