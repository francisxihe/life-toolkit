import { Flex, Button } from '@sue/design-web-react';
import { TaskDetailProvider } from './context';
import TaskForm from './TaskForm';
import TaskChildren from './TaskChildren';
import TodoList from './TodoList';
import { TaskDetailContextProps, useTaskDetailContext } from './context';

export type TaskEditorProps = {
  task: TaskDetailContextProps['task'];
  size?: TaskDetailContextProps['size'];
  afterSubmit?: TaskDetailContextProps['afterSubmit'];
  onClose?: () => void;
};

export default function TaskEditor(props: TaskEditorProps) {
  return (
    <TaskDetailProvider
      mode="editor"
      size={props.size}
      task={props.task}
      afterSubmit={props.afterSubmit}
    >
      <Flex vertical container="full">
        <Flex container="fixed" className="w-full">
          <TaskForm />
        </Flex>
        <Flex vertical container="fill" className="overflow-y-auto">
          <div className="h-1/2 overflow-hidden">
            <TaskChildren />
          </div>
          <div className="h-1/2 overflow-hidden">
            <TodoList />
          </div>
        </Flex>
        <Flex container="fixed" className="w-full">
          <Footer onClose={props.onClose} />
        </Flex>
      </Flex>
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
          if (!(await onSubmit())) return;
          props.onClose?.();
        }}
      >
        确认
      </Button>
    </div>
  );
}
