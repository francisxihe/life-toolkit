import {
  Input,
  Button,
  Popover,
  Grid,
  DatePicker,
} from '@arco-design/web-react';
import { useTaskDetailContext } from './context';
import TaskList from '../TaskList';
import TodoList from '../../../todo/components/TodoList/TodoList';
import SiteIcon from '@/components/SiteIcon';
import clsx from 'clsx';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { CreateButton } from '@/components/Button/CreateButton';
import { useAddTodoModal } from '../../../components/AddTodo';

const { Shrink, Fixed } = FlexibleContainer;

export default function TaskDetailSubTaskList() {
  const { currentTask, showSubTask, refreshTaskDetail } =
    useTaskDetailContext();

  const { open: openAddTodoModal } = useAddTodoModal();
  return (
    <FlexibleContainer className="gap-2">
      <Fixed
        className={clsx([
          'text-title-1 text-text-1 font-medium p-2',
          'flex justify-between items-center',
        ])}
      >
        待办列表
        {/* <AddTodoPopover
          key={currentTask.id}
          initialFormData={{
            parentId: currentTask.id,
          }}
          afterSubmit={async () => {
            await refreshTaskDetail(currentTask.id);
          }}
        > */}
        <CreateButton
          type="text"
          onClick={() => {
            openAddTodoModal({
              initialFormData: {
                parentId: currentTask.id,
              },
            });
          }}
        >
          添加待办
        </CreateButton>
        {/* </AddTodoPopover> */}
      </Fixed>
      <Shrink className="overflow-auto">
        {currentTask?.todoList && (
          <TodoList
            todoList={currentTask.todoList}
            onClickTodo={async (id) => {
              await showSubTask(id);
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
