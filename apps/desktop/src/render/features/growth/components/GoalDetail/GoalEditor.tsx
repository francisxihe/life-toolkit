import {
  GoalDetailProvider,
  GoalDetailContextProps,
  useGoalDetailContext,
} from './context';
import GoalForm from './GoalForm';
import { Button, Flex } from '@sue/design-web-react';
import { GoalService, GoalMapping } from '@true-north/web-service';
import GoalForeign from './GoalForeign';

export type GoalEditorProps = {
  goalId: string;
  size?: GoalDetailContextProps['size'];
  readonly?: boolean;
  onClose?: () => Promise<void>;
  afterSubmit?: GoalDetailContextProps['afterSubmit'];
};

export default function GoalEditor(props: GoalEditorProps) {
  return (
    <GoalDetailProvider
      size={props.size}
      goalId={props.goalId}
      readonly={props.readonly}
      onClose={props.onClose}
      afterSubmit={props.afterSubmit}
    >
      <Flex vertical container="full" className="gap-2">
        <Flex container="fixed" className="w-full border-b border-border-2">
          <GoalForm />
        </Flex>
        <GoalForeign goalId={props.goalId} />
        <Flex container="fixed" className="w-full">
          <GoalEditorFooter />
        </Flex>
      </Flex>
    </GoalDetailProvider>
  );
}

export function GoalEditorFooter() {
  const { onSubmit, onClose, currentGoal, goalFormData } =
    useGoalDetailContext();

  async function handleUpdate(): Promise<boolean> {
    const goal = await GoalService.update(
      currentGoal.id,
      GoalMapping.formDataToUpdateVo(goalFormData),
    );
    return Boolean(goal);
  }

  return (
    <div className="flex justify-end gap-2">
      <Button onClick={() => onClose?.()}>取消</Button>
      <Button
        type="primary"
        onClick={async () => {
          if (!(await handleUpdate())) return;
          await onSubmit();
          onClose?.();
        }}
      >
        确认
      </Button>
    </div>
  );
}
