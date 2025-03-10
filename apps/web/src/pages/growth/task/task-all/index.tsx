'use client';

import { TaskFilters } from './TaskFilters';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { TaskAllProvider } from './context';
import TaskTable from './TaskTable';
import AddTaskPopover from '../components/AddTaskPopover';
import { useTaskAllContext } from './context';
import { CreateButton } from '@/components/Button/CreateButton';

function TaskAll() {
  const { getTaskPage } = useTaskAllContext();

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <FlexibleContainer.Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">
          全部任务
        </div>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex border-b">
        <TaskFilters />
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex my-3">
        <AddTaskPopover
          afterSubmit={async () => {
            getTaskPage();
          }}
        >
          <CreateButton>新建</CreateButton>
        </AddTaskPopover>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Shrink className="px-5 w-full h-full flex">
        <TaskTable />
      </FlexibleContainer.Shrink>
    </FlexibleContainer>
  );
}

export default function TaskAllLayout() {
  return (
    <TaskAllProvider>
      <TaskAll></TaskAll>
    </TaskAllProvider>
  );
}
