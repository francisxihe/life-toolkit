'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import { TodoFormData, TodoService } from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import { TodoVo, TodoWithoutRelationsVo } from '@life-toolkit/vo/growth';
import dayjs from 'dayjs';
import { TodoMapping } from '../../service';
import { TodoStatus } from '@life-toolkit/enum';
import { RepeatVo } from '@life-toolkit/components-repeat/types';

export type TodoDetailProviderProps = {
  children: React.ReactNode;
  todo?: TodoVo | TodoWithoutRelationsVo;
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
  repeat?: TodoVo['repeat'];
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
    const todo = await TodoService.getTodoDetailWithRepeat(id);
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
    const form = todoFormDataRef.current;
    if (!form.name) return;
    let repeat: RepeatVo | undefined;
    if (form.repeat) {
      repeat = {
        currentDate: dayjs(form.planDate).format('YYYY-MM-DD'),
        repeatStartDate: dayjs(form.planDate).format('YYYY-MM-DD'),
        repeatMode: form.repeat.repeatMode,
        repeatConfig: form.repeat.repeatConfig,
        repeatEndMode: form.repeat.repeatEndMode,
        repeatTimes: form.repeat.repeatTimes,
        repeatEndDate: form.repeat.repeatEndDate,
      };
    }
    try {
      await TodoService.createTodo({
        name: form.name,
        planDate: form.planDate,
        planStartAt: form.planTimeRange?.[0] || undefined,
        planEndAt: form.planTimeRange?.[1] || undefined,
        importance: form.importance,
        urgency: form.urgency,
        tags: form.tags,
        description: form.description,
        repeat,
      });
      todoFormDataRef.current = defaultFormData;
      setTodoFormData(todoFormDataRef.current);
    } catch (error) {
      console.error(error);
      return;
    }
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
