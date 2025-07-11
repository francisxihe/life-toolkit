import { Popover, Button } from '@arco-design/web-react';
import { FlexibleContainer } from '@life-toolkit/components-web-ui';
import TaskForm from './TaskForm';
import {
  TaskDetailProvider,
  TaskDetailContextProps,
  useTaskDetailContext,
} from './context';

const { Fixed, Shrink } = FlexibleContainer;

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
      <FlexibleContainer>
        <Shrink>
          <TaskForm />
        </Shrink>
        <Fixed>
          <Footer onClose={props.onClose} />
        </Fixed>
      </FlexibleContainer>
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
          await onSubmit();
          props.onClose?.();
        }}
      >
        确认
      </Button>
    </div>
  );
}
