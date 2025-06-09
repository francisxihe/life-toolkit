'use client';

import { TaskFilters } from './TaskFilters';
import { FlexibleContainer } from '@life-toolkit/components-web-ui';
import { TaskAllProvider } from './context';
import TaskTable from './TaskTable';
import { useTaskAllContext } from './context';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTaskDetail } from '../../components';

function TaskAll() {
  const { getTaskPage } = useTaskAllContext();
  const { openCreateDrawer: openCreateTaskDrawer } = useTaskDetail();

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
        <CreateButton
          onClick={() => {
            openCreateTaskDrawer({
              contentProps: {
                afterSubmit: async () => {
                  await getTaskPage();
                },
              },
            });
          }}
        >
          新建
        </CreateButton>
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
