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
import AddTaskPopover from '../AddTaskPopover';
import clsx from 'clsx';
import FlexibleContainer from '@/components/FlexibleContainer';

const { Shrink, Fixed } = FlexibleContainer;

export default function TaskDetailSubTaskList() {
  const { currentTask, showSubTask, refreshTaskDetail } =
    useTaskDetailContext();

  return (
    <FlexibleContainer className="gap-2">
      <Fixed className="text-title-1 text-text-1 font-medium p-2">
        待办列表
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
      <Fixed>
        <AddTaskPopover
          key={currentTask.id}
          initialFormData={{
            parentId: currentTask.id,
          }}
          afterSubmit={async () => {
            await refreshTaskDetail(currentTask.id);
          }}
        >
          <Button className="!px-2" type="text" size="small">
            <div className="flex items-center gap-1">
              <SiteIcon id="add" />
              添加待办
            </div>
          </Button>
        </AddTaskPopover>
      </Fixed>
    </FlexibleContainer>
  );
}
