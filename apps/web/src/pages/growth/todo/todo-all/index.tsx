'use client';

import { TodoFilters } from './TodoFilters';
import { FlexibleContainer } from '@life-toolkit/components-web-ui';
import { TodoAllProvider } from './context';
import TodoTable from './TodoTable';
import { useTodoDetail } from '../../components';
import { useTodoAllContext } from './context';
import { CreateButton } from '@/components/Button/CreateButton';

function TodoAll() {
  const { getTodoPage } = useTodoAllContext();
  const { CreatePopover: CreateTodoPopover } = useTodoDetail();

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <FlexibleContainer.Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">
          全部待办
        </div>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex border-b">
        <TodoFilters />
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex my-3">
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
