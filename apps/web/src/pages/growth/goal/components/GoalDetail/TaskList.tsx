import { useGoalDetailContext } from './context';
import clsx from 'clsx';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTaskDetail } from '../../../components';
import TaskList from '../../../components/TaskList';

const { Shrink, Fixed } = FlexibleContainer;

export default function TaskDetailTodoList() {
  const { currentGoal, refreshGoalDetail } = useGoalDetailContext();

  const { openCreateDrawer: openAddTaskDrawer } = useTaskDetail();
  return (
    <FlexibleContainer className="gap-2">
      <Fixed
        className={clsx([
          'text-title-1 text-text-1 font-medium p-2',
          'flex justify-between items-center',
        ])}
      >
        待办列表
        <CreateButton
          type="text"
          onClick={() => {
            openAddTaskDrawer({
              creatorProps: {
                initialFormData: {
                  goalId: currentGoal.id,
                },
                afterSubmit: async () => {
                  await refreshGoalDetail(currentGoal.id);
                },
              },
            });
          }}
        >
          添加任务
        </CreateButton>
      </Fixed>
      <Shrink className="overflow-auto">
        {currentGoal?.taskList && (
          <TaskList
            taskList={currentGoal.taskList}
            onClickTask={async (id) => {
              //
            }}
            refreshTaskList={async () => {
              await refreshGoalDetail(currentGoal.id);
            }}
          />
        )}
      </Shrink>
    </FlexibleContainer>
  );
}
