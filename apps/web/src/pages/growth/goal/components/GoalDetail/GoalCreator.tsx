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
      mode="creator"
      size={props.size}
      afterSubmit={props.afterSubmit}
    >
      <FlexibleContainer>
        <Shrink>
          <GoalForm />
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
