import { useTaskDetailContext } from './context';
import TodoList from '../TodoList';
import clsx from 'clsx';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTodoDetail } from '../TodoDetail';

const { Shrink, Fixed } = FlexibleContainer;

export default function TaskDetailTodoList() {
  const { currentTask, refreshTaskDetail } = useTaskDetailContext();

  const { openCreateDrawer: openCreateTodoDrawer } = useTodoDetail();
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
            openCreateTodoDrawer({
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
      </Fixed>
      <Shrink className="overflow-auto">
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
      </Shrink>
    </FlexibleContainer>
  );
}
