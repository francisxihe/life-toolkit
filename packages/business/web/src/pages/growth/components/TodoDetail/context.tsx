'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import { TodoFormData, TodoService } from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import { TodoStatus, TodoVo, TodoItemVo } from '@life-toolkit/vo/growth';
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
  repeat?: string;
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
    setTodoFormData: (formData: Partial<TodoFormData>) => void;
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

  const todoFormDataRef = useRef<TodoFormData>(todoFormData);

  const refreshTodoDetail = async (id: string) => {
    const todo = await TodoService.getTodo(id);
    setCurrentTodo(todo);
    todoFormDataRef.current = TodoMapping.voToFormData(todo);
    setTodoFormData(todoFormDataRef.current);
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
    if (!todoFormDataRef.current.name) {
      return;
    }
    await TodoService.addTodo({
      name: todoFormDataRef.current.name,
      planDate: todoFormDataRef.current.planDate,
      planStartAt: todoFormDataRef.current.planTimeRange?.[0] || undefined,
      planEndAt: todoFormDataRef.current.planTimeRange?.[1] || undefined,
      repeat: todoFormDataRef.current.repeat,
      importance: todoFormDataRef.current.importance,
      urgency: todoFormDataRef.current.urgency,
      tags: todoFormDataRef.current.tags,
      description: todoFormDataRef.current.description,
    });
    todoFormDataRef.current = defaultFormData;
    setTodoFormData(todoFormDataRef.current);
  }

  async function handleUpdate() {
    const data = TodoMapping.formDataToUpdateVo(todoFormDataRef.current);
    await TodoService.updateTodo(currentTodo.id, data);
  }

  const onSubmit = async () => {
    if (props.mode === 'creator') {
      await handleCreate();
    } else {
      await handleUpdate();
    }
    await props.afterSubmit?.();
  };

  return {
    currentTodo,
    todoFormData,
    setTodoFormData: (formData: Partial<TodoFormData>) => {
      todoFormDataRef.current = { ...todoFormDataRef.current, ...formData };
      setTodoFormData(todoFormDataRef.current);
    },
    onSubmit,
  };
});
