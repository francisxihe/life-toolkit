'use client';

import { TodoFilters } from './TodoFilters';
import { FlexibleContainer } from 'francis-component-react';
import { TodoAllProvider } from './context';
import TodoTable from './TodoTable';
import { useTodoDetail } from '../../components';
import { useTodoAllContext } from './context';
import { CreateButton } from '@/components/Button/CreateButton';

const { Fixed, Shrink } = FlexibleContainer;

function TodoAll() {
  const { getTodoPage } = useTodoAllContext();
  const { CreatePopover: CreateTodoPopover } = useTodoDetail();

  return (
    <>
      <Fixed className="px-5 flex border-b">
        <TodoFilters />
      </Fixed>

      <Fixed className="px-5 flex my-3">
        <CreateTodoPopover
          creatorProps={{
            showSubmitButton: true,
            afterSubmit: async () => {
              getTodoPage();
            },
          }}
        >
          <CreateButton>新建</CreateButton>
        </CreateTodoPopover>
      </Fixed>

      <Shrink className="px-5 w-full h-full flex">
        <TodoTable />
      </Shrink>
    </>
  );
}

export default function TodoAllLayout() {
  return (
    <TodoAllProvider>
      <TodoAll></TodoAll>
    </TodoAllProvider>
  );
}
