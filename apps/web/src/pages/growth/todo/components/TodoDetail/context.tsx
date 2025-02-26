'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import type { SubTodoVo, UpdateTodoVo } from '@life-toolkit/vo/todo';
import { TodoFormData } from '../../types';
import TodoService from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import type { TodoDetailProps } from '.';

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
  status: 'todo' | 'done' | 'abandoned';
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
    subTodoList: SubTodoVo[];
    setTodoFormData: Dispatch<React.SetStateAction<TodoFormData>>;
    onClose: () => Promise<void> | null;
    onChange: (data: UpdateTodoVo) => Promise<void>;
    showSubTodo: (id: string) => Promise<void>;
    getSubTodoList: (id: string) => Promise<void>;
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

  const [level, setLevel] = useState(0);

  const [currentTodo, setCurrentTodo] = useState<CurrentTodo>(props.todo);

  const [todoFormData, setTodoFormData] = useState<TodoFormData>();

  const [subTodoList, setSubTodoList] = useState<SubTodoVo[]>([]);

  const currentTodoRef = useRef<CurrentTodo>();

  const showSubTodo = async (id: string) => {
    setLevel(level + 1);
    await refreshTodoDetail(id);
  };

  const refreshTodoDetail = async (id: string) => {
    const fetchedTodoWithSub = await TodoService.getSubTodoWithSub(id);
    currentTodoRef.current = {
      ...fetchedTodoWithSub,
      planDate: currentTodo.planDate,
    };
    setCurrentTodo(currentTodoRef.current);
    setTodoFormData(transformTodoVoToFormData(currentTodoRef.current));
    await getSubTodoList(id);
  };

  const getSubTodoList = async (id: string) => {
    const subTodoList = await TodoService.getSubTodoList({
      parentId: id,
    });
    setSubTodoList(subTodoList);
  };

  const initTodoFormData = useCallback(async () => {
    currentTodoRef.current = props.todo;
    setTodoFormData(transformTodoVoToFormData(currentTodoRef.current));
    await getSubTodoList(props.todo.id);
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
    if (level > 0) {
      const updatedTodo = await TodoService.updateSubTodo(currentTodo.id, data);
      await refreshTodoDetail(updatedTodo.id);
    } else {
      const updatedTodo = await TodoService.updateTodo(currentTodo.id, data);
      await props.onChange(updatedTodo);
    }
  }

  return {
    currentTodo,
    todoFormData,
    setTodoFormData,
    onClose,
    onChange,
    showSubTodo,
    getSubTodoList,
    subTodoList,
  };
});
