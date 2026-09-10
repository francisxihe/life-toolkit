import { useTaskDetailContext } from './context';
import TaskList from '../TaskList';
import clsx from 'clsx';
import { Flex } from '@sue/design-web-react';
import { useTaskDetail } from '.';
import { CreateButton } from '@/components/Button/CreateButton';

export default function TaskChildren() {
  const { currentTask, showSubTask, refreshTaskDetail } =
    useTaskDetailContext();

  const { CreatePopover: CreateTaskPopover } = useTaskDetail();

  return (
    <Flex vertical container="full" className="gap-2 border-b">
      <Flex
        container="fixed"
        className={clsx([
          'w-full',
          'text-title-1 text-text-1 font-medium p-2',
          'flex justify-between items-center',
        ])}
      >
        子任务
        <CreateTaskPopover
          creatorProps={{
            initialFormData: {
              parentId: currentTask?.id,
            },
            afterSubmit: async () => {
              await refreshTaskDetail(currentTask?.id);
            },
          }}
        >
          <CreateButton className="!px-2" type="text" size="small">
            添加子任务
          </CreateButton>
        </CreateTaskPopover>
      </Flex>
      <Flex container="fill" className="overflow-auto">
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
      </Flex>
    </Flex>
  );
}
