import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import type { TaskVo, UpdateTaskVo } from '@life-toolkit/vo/growth';
import { TaskDetailProvider } from './context';
import TaskForm from './TaskForm';
import SubTaskList from './SubTaskList';
import TodoList from './TodoList';
import { TaskDetailContextProps, useTaskDetailContext } from './context';
import { Button } from '@arco-design/web-react';

const { Shrink, Fixed } = FlexibleContainer;

export type TaskEditorProps = {
  task: TaskVo;
  afterSubmit?: TaskDetailContextProps['afterSubmit'];
  onClose?: () => void;
};

export default function TaskEditor(props: TaskEditorProps) {
  return (
    <TaskDetailProvider
      mode="editor"
      task={props.task}
      afterSubmit={props.afterSubmit}
    >
      <FlexibleContainer>
        <Fixed>
          <TaskForm />
        </Fixed>
        <Shrink absolute>
          <div className="h-1/2 overflow-hidden">
            <SubTaskList />
          </div>
          <div className="h-1/2 overflow-hidden">
            <TodoList />
          </div>
        </Shrink>
        <Fixed>
          <Footer onClose={props.onClose} />
        </Fixed>
      </FlexibleContainer>
    </TaskDetailProvider>
  );
}

function Footer(props: { onClose?: () => void }) {
  const { onSubmit } = useTaskDetailContext();
  return (
    <div className="flex justify-end gap-2">
      <Button onClick={() => props.onClose?.()}>取消</Button>
      <Button
        type="primary"
        onClick={async () => {
          await onSubmit();
          props.onClose?.();
        }}
      >
        确认
      </Button>
    </div>
  );
}
