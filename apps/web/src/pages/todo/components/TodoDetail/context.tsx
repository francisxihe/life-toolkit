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
import { Todo, TodoNode, SubTodo } from '../../service/types';
import { TodoFormData } from '../../types';
import TodoService from '../../service';
import { createInjectState } from '@/utils/createInjectState';

export const [TodoDetailProvider, useTodoDetailContext] = createInjectState<
  {
    todoNode: TodoNode;
    todoFormData: TodoFormData;
    setTodoFormData: Dispatch<React.SetStateAction<TodoFormData>>;
    onClose: () => Promise<void> | null;
    onChange: (todo: TodoFormData) => Promise<void>;
    refreshSubTodoFormData: (todo: Todo | SubTodo) => Promise<void>;
    initTodoFormData: (todo: Todo) => Promise<void>;
  },
  {
    children: React.ReactNode;
    todo: Todo;
    onClose: () => Promise<void> | null;
    onChange: (todo: Todo) => Promise<void>;
  }
>((props) => {
  function transformTodo(todo: TodoNode): TodoFormData {
    return {
      name: todo.name,
      description: todo.description,
      tags: todo.tags,
      importance: todo.importance,
      urgency: todo.urgency,
      planDate: todo.planDate,
      planTimeRange: [todo.planStartAt, todo.planEndAt],
      recurring: todo.recurring,
      subTodoList: todo.subTodoList,
    };
  }

  function transformTodoFormData(todoFormData: TodoFormData): TodoNode {
    return {
      name: todoFormData.name,
      description: todoFormData.description,
      tags: todoFormData.tags,
      importance: todoFormData.importance,
      urgency: todoFormData.urgency,
      planDate: todoFormData.planDate,
      planStartAt: todoFormData.planTimeRange?.[0],
      planEndAt: todoFormData.planTimeRange?.[1],
      recurring: todoFormData.recurring,
      id: todoNode.id,
      createdAt: todoNode.createdAt,
      status: todoNode.status,
      subTodoList: todoNode.subTodoList,
    };
  }

  const [todoFormData, setTodoFormData] = useState<TodoFormData>();

  const [todoNode, setTodoNode] = useState<TodoNode>(props.todo as TodoNode);
  const todoNodeRef = useRef<TodoNode>();

  const refreshSubTodoFormData = async (todo: Todo | SubTodo) => {
    const fetchedTodoNode = await TodoService.getSubTodoNode(todo.id);
    todoNodeRef.current = {
      ...fetchedTodoNode,
      planDate: todoNode.planDate,
    };
    setTodoNode(todoNodeRef.current);
    setTodoFormData(transformTodo(todoNodeRef.current));
  };

  const initTodoFormData = useCallback(async () => {
    const fetchedTodoNode = await TodoService.getTodoNode(props.todo.id);
    setTodoNode(fetchedTodoNode);
    todoNodeRef.current = fetchedTodoNode;
    setTodoFormData(transformTodo(todoNodeRef.current));
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
    const todo = transformTodoFormData(todoFormData);
    await TodoService.updateTodo(todo.id, todo);
    await props.onChange(todo);
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
