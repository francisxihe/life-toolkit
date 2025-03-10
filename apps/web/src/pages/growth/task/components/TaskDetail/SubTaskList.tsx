import { Input, Button } from '@arco-design/web-react';
import { useTaskDetailContext } from './context';
import TaskList from '../TaskList';
import SiteIcon from '@/components/SiteIcon';
import AddTaskPopover from './TaskCreator';
import clsx from 'clsx';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { useTaskDetail } from './';
import { CreateButton } from '@/components/Button/CreateButton';

const { Shrink, Fixed } = FlexibleContainer;

export default function TaskDetailSubTaskList() {
  const { currentTask, showSubTask, refreshTaskDetail } =
    useTaskDetailContext();
  const { openCreateDrawer: openCreateTaskDrawer } = useTaskDetail();
  return (
    <FlexibleContainer className="gap-2 border-b">
      <Fixed
        className={clsx([
          'text-title-1 text-text-1 font-medium p-2',
          'flex justify-between items-center',
        ])}
      >
        子任务
        <CreateButton
          className="!px-2"
          type="text"
          size="small"
          onClick={() => {
            openCreateTaskDrawer({
              creatorProps: {
                initialFormData: {
                  parentId: currentTask.id,
                },
                afterSubmit: async () => {
                  await refreshTaskDetail(currentTask.id);
                },
              },
            });
          }}
        >
          添加子任务
        </CreateButton>
      </Fixed>
      <Shrink className="overflow-auto">
        {currentTask?.children && (
          <TaskList
            taskList={currentTask.children}
            onClickTask={async (id) => {
              await showSubTask(id);
            }}
            refreshTaskList={async () => {
              await refreshTaskDetail(currentTask.id);
            }}
          />
        )}
      </Shrink>
    </FlexibleContainer>
  );
}
