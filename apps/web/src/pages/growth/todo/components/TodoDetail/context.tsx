'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import type { UpdateTodoVo } from '@life-toolkit/vo/growth';
import { TodoFormData } from '../../types';
import TodoService from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import type { TodoDetailProps } from '.';
import { TodoStatus } from '@life-toolkit/vo/growth';

export type CurrentTodo = {
  id: string;
  planDate: string;
  planStartAt?: string;
  planEndAt?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  importance?: number;
  urgency?: number;
  tags?: string[];
  description?: string;
  name: string;
  status: TodoStatus;
};

export const [TodoDetailProvider, useTodoDetailContext] = createInjectState<{
  PropsType: {
    children: React.ReactNode;
    todo: TodoDetailProps['todo'];
    onClose: TodoDetailProps['onClose'];
    onChange: TodoDetailProps['onChange'];
  };
  ContextType: {
    currentTodo: CurrentTodo;
    todoFormData: TodoFormData;
    setTodoFormData: Dispatch<React.SetStateAction<TodoFormData>>;
    onClose: () => Promise<void> | null;
    onChange: (data: UpdateTodoVo) => Promise<void>;
  };
}>((props) => {
  function transformTodoVoToFormData(todo: CurrentTodo): TodoFormData {
    return {
      name: todo.name,
      description: todo.description,
      tags: todo.tags,
      importance: todo.importance,
      urgency: todo.urgency,
      planDate: todo.planDate,
      planTimeRange: [todo.planStartAt, todo.planEndAt],
      repeat: todo.repeat,
    };
  }

  const [currentTodo, setCurrentTodo] = useState<CurrentTodo>(props.todo);

  const [todoFormData, setTodoFormData] = useState<TodoFormData>();

  const currentTodoRef = useRef<CurrentTodo>();

  const initTodoFormData = useCallback(async () => {
    currentTodoRef.current = props.todo;
    setTodoFormData(transformTodoVoToFormData(currentTodoRef.current));
  }, [props.todo]);

  useEffect(() => {
    initTodoFormData();
  }, [initTodoFormData]);

  let onClose = null;
  if (props.onClose) {
    onClose = async () => {
      setTodoFormData(null);
      await props.onClose();
    };
  }

  async function onChange(data: UpdateTodoVo) {
    setTodoFormData({
      ...todoFormData,
      ...data,
    });
    const updatedTodo = await TodoService.updateTodo(currentTodo.id, data);
    await props.onChange(updatedTodo);
  }

  return {
    currentTodo,
    todoFormData,
    setTodoFormData,
    onClose,
    onChange,
  };
});
