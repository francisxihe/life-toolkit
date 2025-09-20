'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TodoVo, TodoFilterVo } from '@life-toolkit/vo';
import { TodoService } from '../../service';

interface TodoContextType {
  todoList: TodoVo[];
  loading: boolean;
  loadTodoList: (params?: TodoFilterVo) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todoList, setTodoList] = useState<TodoVo[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTodoList(params?: TodoFilterVo) {
    try {
      setLoading(true);
      const res = await TodoService.getTodoListWithRepeat(params);
      setTodoList(res.list);
    } catch (error) {
      console.error('Failed to load todo list:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 加载真实数据
    loadTodoList();
  }, []);

  return (
    <TodoContext.Provider
      value={{
        todoList,
        loading,
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
