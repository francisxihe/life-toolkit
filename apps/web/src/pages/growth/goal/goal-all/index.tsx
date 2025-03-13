'use client';

import { GoalFilters } from './GoalFilters';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { GoalAllProvider } from './context';
import GoalTable from './GoalTable';
import { useGoalAllContext } from './context';
import { CreateButton } from '@/components/Button/CreateButton';
import { useGoalDetail } from '../components/GoalDetail';

function GoalAll() {
  const { getGoalPage } = useGoalAllContext();
  const { CreateGoalPopover } = useGoalDetail();
  const { openCreateDrawer } = useGoalDetail();

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <FlexibleContainer.Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">
          全部目标
        </div>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex border-b">
        <GoalFilters />
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Fixed className="px-5 flex my-3">
        <CreateButton
          onClick={() =>
            openCreateDrawer({
              creatorProps: {
                afterSubmit: async () => {
                  getGoalPage();
                },
              },
            })
          }
        >
          新建
        </CreateButton>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Shrink className="px-5 w-full h-full flex">
        <GoalTable />
      </FlexibleContainer.Shrink>
    </FlexibleContainer>
  );
}

export default function GoalAllLayout() {
  return (
    <GoalAllProvider>
      <GoalAll></GoalAll>
    </GoalAllProvider>
  );
}
