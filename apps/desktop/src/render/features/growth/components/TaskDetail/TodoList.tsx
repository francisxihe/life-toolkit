import { useTaskDetailContext } from './context';
import TodoList from '../TodoList';
import clsx from 'clsx';
import { Flex } from '@sue/design-web-react';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTodoDetail } from '../TodoDetail';

export default function TaskDetailTodoList() {
  const { currentTask, refreshTaskDetail } = useTaskDetailContext();

  const { openCreateDrawer } = useTodoDetail();

  if (!currentTask) return null;

  return (
    <Flex vertical container="full" className="gap-2">
      <Flex
        container="fixed"
        className={clsx([
          'w-full',
          'text-title-1 text-text-1 font-medium p-2',
          'flex justify-between items-center',
        ])}
      >
        待办列表
        <CreateButton
          type="text"
          onClick={() => {
            openCreateDrawer({
              contentProps: {
                initialFormData: {
                  taskId: currentTask.id,
                },
                afterSubmit: async () => {
                  await refreshTaskDetail(currentTask.id);
                },
              },
            });
          }}
        >
          添加待办
        </CreateButton>
      </Flex>
      <Flex container="fill" className="overflow-auto">
        {currentTask?.todoList && (
          <TodoList
            todoList={currentTask.todoList}
            onClickTodo={async () => {
              //
            }}
            refreshTodoList={async () => {
              await refreshTaskDetail(currentTask.id);
            }}
          />
        )}
      </Flex>
    </Flex>
  );
}
