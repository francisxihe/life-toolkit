import { useGoalDetailContext } from './context';
import clsx from 'clsx';
import { FlexibleContainer } from 'francis-component-react';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTaskDetail } from '..';
import TaskList from '../TaskList';

const { Shrink, Fixed } = FlexibleContainer;

export default function TaskDetailTodoList() {
  const { currentGoal, refreshGoalDetail } = useGoalDetailContext();

  const { CreatePopover: CreateTaskPopover } = useTaskDetail();

  return (
    currentGoal && (
      <FlexibleContainer className="gap-2">
        <Fixed
          className={clsx([
            'text-title-1 text-text-1 font-medium p-2',
            'flex justify-between items-center',
          ])}
        >
          任务列表
          <CreateTaskPopover
            creatorProps={{
              initialFormData: {
                goalId: currentGoal.id,
                planTimeRange: [currentGoal.startAt, currentGoal.endAt],
              },
              afterSubmit: async () => {
                await refreshGoalDetail(currentGoal.id);
              },
            }}
          >
            <CreateButton className="!px-2" type="text" size="small">
              添加任务
            </CreateButton>
          </CreateTaskPopover>
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
    )
  );
}
