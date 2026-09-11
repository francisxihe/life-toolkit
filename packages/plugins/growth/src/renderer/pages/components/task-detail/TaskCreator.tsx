import { Popover, Button, Flex } from '@sue/design-web-react';
import TaskForm from './TaskForm';
import {
  TaskDetailProvider,
  TaskDetailContextProps,
  useTaskDetailContext,
} from './context';

export type TaskCreatorProps = {
  initialFormData?: TaskDetailContextProps['initialFormData'];
  size?: TaskDetailContextProps['size'];
  afterSubmit?: TaskDetailContextProps['afterSubmit'];
  onClose?: () => Promise<void>;
} & React.ComponentProps<typeof Popover>;

export default function TaskCreator(props: TaskCreatorProps) {
  return (
    <TaskDetailProvider
      mode="creator"
      size={props.size}
      initialFormData={props.initialFormData}
      afterSubmit={props.afterSubmit}
    >
      <Flex vertical container="full">
        <Flex container="fill">
          <TaskForm />
        </Flex>
        <Flex container="fixed" className="w-full">
          <Footer onClose={props.onClose} />
        </Flex>
      </Flex>
    </TaskDetailProvider>
  );
}

function Footer(props: { onClose?: () => Promise<void> }) {
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
