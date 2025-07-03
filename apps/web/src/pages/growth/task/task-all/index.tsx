'use client';

import { TaskFilters } from './TaskFilters';
import { FlexibleContainer } from '@life-toolkit/components-web-ui';
import { TaskAllProvider } from './context';
import TaskTable from './TaskTable';
import { useTaskAllContext } from './context';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTaskDetail } from '../../components';

const { Fixed, Shrink } = FlexibleContainer;

function TaskAll() {
  const { getTaskPage } = useTaskAllContext();
  const { openCreateDrawer: openCreateTaskDrawer } = useTaskDetail();

  return (
    <FlexibleContainer>
      <Fixed className="px-5 flex border-b">
        <TaskFilters />
      </Fixed>

      <Fixed className="px-5 flex my-3">
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
      </Fixed>

      <Shrink className="px-5 w-full h-full flex">
        <TaskTable />
      </Shrink>
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
