import { FlexibleContainer } from 'francis-component-react';
import { GoalVo } from '@life-toolkit/vo/growth';
import {
  GoalDetailProvider,
  GoalDetailContextProps,
  useGoalDetailContext,
} from './context';
import GoalForm from './GoalForm';
import GoalChildren from './GoalChildren';
import { Button, Spin } from '@arco-design/web-react';
import TaskList from './TaskList';
import { useCallback, useEffect, useState } from 'react';

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
      size={props.size}
      goal={props.goal}
      onClose={props.onClose}
      afterSubmit={props.afterSubmit}
    >
      <GoalEditorMain goal={props.goal} />
    </GoalDetailProvider>
  );
}

function GoalEditorMain(props: { goal: GoalVo }) {
  const [loading, setLoading] = useState(false);
  const { goal } = props;
  const { refreshGoalDetail } = useGoalDetailContext();

  useEffect(() => {
    async function init() {
      setLoading(true);
      await refreshGoalDetail(goal.id);
      setLoading(false);
    }
    init();
  }, [refreshGoalDetail, goal]);

  if (loading) {
    return <Spin dot />;
  }

  return (
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
        <GoalEditorFooter />
      </Fixed>
    </FlexibleContainer>
  );
}

function GoalEditorFooter() {
  const { onSubmit, onClose, handleUpdate } = useGoalDetailContext();
  return (
    <div className="flex justify-end gap-2">
      <Button onClick={() => onClose?.()}>取消</Button>
      <Button
        type="primary"
        onClick={async () => {
          await handleUpdate();
          await onSubmit();
          onClose?.();
        }}
      >
        确认
      </Button>
    </div>
  );
}
