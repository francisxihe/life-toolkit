'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import { TodoFormData, TodoService } from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import {
  TodoStatus,
  UpdateTodoVo,
  TodoVo,
  TodoItemVo,
} from '@life-toolkit/vo/growth';
import dayjs from 'dayjs';
import { TodoMapping } from '../../service';

export type TodoDetailProviderProps = {
  children: React.ReactNode;
  todo?: TodoVo | TodoItemVo;
  initialFormData?: Partial<TodoFormData>;
  mode: 'editor' | 'creator';
  size?: 'small' | 'default';
  afterSubmit?: () => Promise<void>;
};

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
  PropsType: TodoDetailProviderProps;
  ContextType: {
    currentTodo: CurrentTodo;
    todoFormData: TodoFormData;
    setTodoFormData: Dispatch<React.SetStateAction<TodoFormData>>;
    onSubmit: () => Promise<void>;
  };
}>((props) => {
  const [currentTodo, setCurrentTodo] = useState<CurrentTodo>(props.todo);

  const defaultFormData = {
    name: '',
    planDate: dayjs().format('YYYY-MM-DD'),
    ...props.initialFormData,
  };

  const [todoFormData, setTodoFormData] =
    useState<TodoFormData>(defaultFormData);

  const refreshTodoDetail = async (id: string) => {
    const todo = await TodoService.getTodo(id);
    setCurrentTodo(todo);
    setTodoFormData(TodoMapping.voToFormData(todo));
  };

  const initTodoFormData = useCallback(async () => {
    await refreshTodoDetail(props.todo.id);
  }, [props.todo]);

  useEffect(() => {
    async function init() {
      if (props.mode === 'editor') {
        await initTodoFormData();
      }
    }
    init();
  }, [props.mode, initTodoFormData]);

  async function handleCreate() {
    if (!todoFormData.name) {
      return;
    }
    await TodoService.addTodo({
      name: todoFormData.name,
      planDate: todoFormData.planDate,
      planStartAt: todoFormData.planTimeRange?.[0] || undefined,
      planEndAt: todoFormData.planTimeRange?.[1] || undefined,
      repeat: todoFormData.repeat,
      importance: todoFormData.importance,
      urgency: todoFormData.urgency,
      tags: todoFormData.tags,
      description: todoFormData.description,
    });
    setTodoFormData(defaultFormData);
  }

  async function handleUpdate(data: Partial<UpdateTodoVo>) {
    await TodoService.updateTodo(currentTodo.id, data);
  }

  const onSubmit = async () => {
    if (props.mode === 'creator') {
      await handleCreate();
    } else {
      await handleUpdate(TodoMapping.formDataToUpdateVo(todoFormData));
    }
    await props.afterSubmit?.();
  };

  return {
    currentTodo,
    todoFormData,
    setTodoFormData,
    onSubmit,
  };
});
