import { Empty } from '@sue/design-web-react';
import clsx from 'clsx';
import { openTaskDetailDrawer } from '../../../task/detail/TaskDetailDrawer';
import { CreateButton } from '@/components/Button/CreateButton';
import { useGoalDetailContext } from '../context';
import { useTaskDetail } from '../..';
import TaskList from '../../TaskList';

export function GoalTaskList() {
  const { currentGoal, refreshGoalDetail } = useGoalDetailContext();
  // 在当前页面打开任务详情抽屉
  const handleTaskClick = async (taskId: string) => {
    openTaskDetailDrawer({ taskId });
  };

  return currentGoal.taskList?.length > 0 ? (
    <TaskList
      taskList={currentGoal.taskList}
      onClickTask={handleTaskClick}
      refreshTaskList={async () => {
        await refreshGoalDetail(currentGoal.id);
      }}
    />
  ) : (
    <div
      className={clsx(['w-full h-full', 'flex items-center justify-center'])}
    >
      <Empty description="暂无任务" />
    </div>
  );
}

export function CreateTask() {
  const { currentGoal, refreshGoalDetail } = useGoalDetailContext();
  const { CreatePopover: CreateTaskPopover } = useTaskDetail();

  return (
    <div
      className={clsx([
        'text-title-1 text-text-1 font-medium',
        'flex justify-between items-center',
      ])}
    >
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
    </div>
  );
}
