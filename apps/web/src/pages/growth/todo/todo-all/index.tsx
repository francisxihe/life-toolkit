'use client';

import { TodoFilters } from './TodoFilters';
import FlexibleContainer from '@/components/FlexibleContainer';
import { TodoAllProvider } from './context';
import TodoTable from './TodoTable';
import { openModal } from '@/hooks/OpenModal';
import AddTodo from '../components/AddTodo';
import { useRef } from 'react';
import { TodoFormData } from '../types';
import TodoService from '../service';
import { useTodoAllContext } from './context';
import { CreateButton } from '@/components/Button/CreateButton';

function TodoAll() {
  const todoFormDataRef = useRef<TodoFormData | null>(null);
  const { getTodoPage } = useTodoAllContext();

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <FlexibleContainer.Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">全部待办</div>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex border-b">
        <TodoFilters />
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex my-3">
        <CreateButton
          onClick={() => {
            openModal({
              title: <div className="text-title">添加待办</div>,
              content: (
                <AddTodo
                  onChange={(todoFormData) => {
                    todoFormDataRef.current = todoFormData;
                  }}
                  onSubmit={async (todoFormData) => {
                    await TodoService.addTodo({
                      name: todoFormData.name,
                      importance: todoFormData.importance,
                      urgency: todoFormData.urgency,
                      planDate: todoFormData.planDate || undefined,
                      startAt: todoFormData.planTimeRange?.[0] || undefined,
                      endAt: todoFormData.planTimeRange?.[1] || undefined,
                      repeat: todoFormData.repeat,
                      tags: todoFormData.tags,
                    });
                    getTodoPage();
                  }}
                />
              ),
              onOk: async () => {
                const todoFormData = todoFormDataRef.current;
                await TodoService.addTodo({
                  name: todoFormData.name,
                  importance: todoFormData.importance,
                  urgency: todoFormData.urgency,
                  planDate: todoFormData.planDate || undefined,
                  startAt: todoFormData.planTimeRange?.[0] || undefined,
                  endAt: todoFormData.planTimeRange?.[1] || undefined,
                  repeat: todoFormData.repeat,
                  tags: todoFormData.tags,
                });
                getTodoPage();
              },
            });
          }}
        >
          新建
        </CreateButton>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Shrink className="px-5 w-full h-full flex">
        <TodoTable />
      </FlexibleContainer.Shrink>
    </FlexibleContainer>
  );
}

export default function TodoAllLayout() {
  return (
    <TodoAllProvider>
      <TodoAll></TodoAll>
    </TodoAllProvider>
  );
}
