'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  useRef,
  useCallback,
} from 'react';
import type { Todo } from '@life-toolkit/vo';
import { TodoFormData } from '../../types';
import TodoService from '../../service';
import { createInjectState } from '@/utils/createInjectState';

export const [TodoDetailProvider, useTodoDetailContext] = createInjectState<
  {
    todoNode: Todo.TodoWithSubVo;
    todoFormData: TodoFormData;
    setTodoFormData: Dispatch<React.SetStateAction<TodoFormData>>;
    onClose: () => Promise<void> | null;
    onChange: (todo: TodoFormData) => Promise<void>;
    refreshSubTodoFormData: (id: string) => Promise<void>;
    initTodoFormData: (todo: Todo.TodoVo) => Promise<void>;
  },
  {
    children: React.ReactNode;
    todo: Todo.TodoVo;
    onClose: () => Promise<void> | null;
    onChange: (todo: Todo.TodoVo) => Promise<void>;
  }
>((props) => {
  function transformTodoVoToFormData(todo: Todo.TodoWithSubVo): TodoFormData {
    return {
      name: todo.name,
      description: todo.description,
      tags: todo.tags,
      importance: todo.importance,
      urgency: todo.urgency,
      planDate: todo.planDate,
      planTimeRange: [todo.planStartAt, todo.planEndAt],
      repeat: todo.repeat,
      subTodoList: [...todo.subTodoList],
    };
  }

  function transformFormDataToCreateVo(
    todoFormData: TodoFormData,
  ): Todo.CreateTodoVo {
    return {
      name: todoFormData.name,
      description: todoFormData.description,
      tags: todoFormData.tags,
      importance: todoFormData.importance,
      urgency: todoFormData.urgency,
      planDate: todoFormData.planDate,
      planStartAt: todoFormData.planTimeRange?.[0],
      planEndAt: todoFormData.planTimeRange?.[1],
      repeat: todoFormData.repeat,
    };
  }

  const [todoFormData, setTodoFormData] = useState<TodoFormData>();

  const [todoNode, setTodoNode] = useState<Todo.TodoWithSubVo>(
    props.todo as Todo.TodoWithSubVo,
  );
  const todoNodeRef = useRef<Todo.TodoWithSubVo>();

  const refreshSubTodoFormData = async (id: string) => {
    const fetchedTodoNode = await TodoService.getSubTodoNode(id);
    todoNodeRef.current = {
      ...fetchedTodoNode,
      planDate: todoNode.planDate,
    };
    setTodoNode(todoNodeRef.current);
    setTodoFormData(transformTodoVoToFormData(todoNodeRef.current));
  };

  const initTodoFormData = useCallback(async () => {
    const fetchedTodoNode = await TodoService.getTodoWithSub(props.todo.id);
    setTodoNode(fetchedTodoNode);
    todoNodeRef.current = fetchedTodoNode;
    setTodoFormData(transformTodoVoToFormData(todoNodeRef.current));
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

  async function onChange(todoFormData: TodoFormData) {
    setTodoFormData(todoFormData);
    const todo = transformFormDataToCreateVo(todoFormData);
    const updatedTodo = await TodoService.updateTodo(todoNode.id, todo);
    await props.onChange(updatedTodo);
  }

  return {
    todoNode,
    todoFormData,
    setTodoFormData,
    onClose,
    onChange,
    refreshSubTodoFormData,
    initTodoFormData,
  };
});
