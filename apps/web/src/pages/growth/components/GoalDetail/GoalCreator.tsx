import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import {
  GoalDetailProvider,
  useGoalDetailContext,
  GoalDetailContextProps,
} from './context';
import GoalForm from './GoalForm';
import { Button } from '@arco-design/web-react';

const { Shrink, Fixed } = FlexibleContainer;

export type GoalCreatorProps = {
  size?: GoalDetailContextProps['size'];
  initialFormData?: GoalDetailContextProps['initialFormData'];
  afterSubmit?: GoalDetailContextProps['afterSubmit'];
  onClose?: () => Promise<void>;
};

export default function GoalCreator(props: GoalCreatorProps) {
  return (
    <GoalDetailProvider
      initialFormData={props.initialFormData}
      size={props.size}
      afterSubmit={props.afterSubmit}
      onClose={props.onClose}
    >
      <FlexibleContainer>
        <Shrink>
          <GoalForm />
        </Shrink>
        <Fixed>
          <Footer />
        </Fixed>
      </FlexibleContainer>
    </GoalDetailProvider>
  );
}

function Footer() {
  const { onSubmit, goalFormData, handleCreate, onClose } =
    useGoalDetailContext();
  return (
    <div className="flex justify-end gap-2">
      <Button onClick={() => onClose?.()}>取消</Button>
      <Button
        type="primary"
        onClick={async () => {
          if (!goalFormData.name) {
            return;
          }
          await handleCreate();
          await onSubmit();
          onClose?.();
        }}
      >
        确认
      </Button>
    </div>
  );
}
