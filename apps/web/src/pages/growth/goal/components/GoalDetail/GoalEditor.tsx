import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { GoalVo } from '@life-toolkit/vo/growth';
import {
  GoalDetailProvider,
  GoalDetailContextProps,
  useGoalDetailContext,
} from './context';
import GoalForm from './GoalForm';
import GoalChildren from './GoalChildren';
import { Button } from '@arco-design/web-react';
import TaskList from './TaskList';

const { Shrink, Fixed } = FlexibleContainer;

export type GoalEditorProps = {
  goal: GoalVo;
  size?: GoalDetailContextProps['size'];
  onClose?: () => Promise<void>;
  afterSubmit?: GoalDetailContextProps['afterSubmit'];
};

export default function GoalEditor(props: GoalEditorProps) {
  return (
    <GoalDetailProvider
      mode="editor"
      size={props.size}
      goal={props.goal}
      afterSubmit={props.afterSubmit}
    >
      <FlexibleContainer>
        <Fixed>
          <GoalForm />
        </Fixed>
        <Shrink>
          <Shrink absolute>
            <div className="h-1/2 overflow-hidden">
              <GoalChildren />
            </div>
            <div className="h-1/2 overflow-hidden">
              <TaskList />
            </div>
          </Shrink>
        </Shrink>
        <Fixed>
          <Footer onClose={props.onClose} />
        </Fixed>
      </FlexibleContainer>
    </GoalDetailProvider>
  );
}

function Footer(props: { onClose?: () => void }) {
  const { onSubmit } = useGoalDetailContext();
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
