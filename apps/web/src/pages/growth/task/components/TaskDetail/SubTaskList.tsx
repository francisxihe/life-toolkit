import {
  Input,
  Button,
  Popover,
  Grid,
  DatePicker,
} from '@arco-design/web-react';
import { useTaskDetailContext } from './context';
import TaskList from '../TaskList';
import SiteIcon from '@/components/SiteIcon';
import AddTaskPopover from '../AddTaskPopover';
import clsx from 'clsx';
import FlexibleContainer from '@/components/FlexibleContainer';

const { Shrink, Fixed } = FlexibleContainer;

export default function TaskDetailSubTaskList() {
  const { currentTask, showSubTask, refreshTaskDetail } =
    useTaskDetailContext();

  return (
    <FlexibleContainer className="gap-2 border-b">
      <Fixed
        className={clsx([
          'text-title-1 text-text-1 font-medium p-2',
          'flex justify-between items-center',
        ])}
      >
        子任务
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
              添加子任务
            </div>
          </Button>
        </AddTaskPopover>
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
