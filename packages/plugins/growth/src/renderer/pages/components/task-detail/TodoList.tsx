import { useTaskDetailContext } from './context';
import TodoItems from '../todo-list';
import clsx from 'clsx';
import { Flex } from '@sue/design-web-react';
import { CreateButton } from '@true-north/plugin-ui';
import { useTodoDetail } from '../todo-detail';

export default function TodoList() {
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
          <TodoItems
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
