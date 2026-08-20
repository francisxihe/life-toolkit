import {
  GoalDetailProvider,
  useGoalDetailContext,
  GoalDetailContextProps,
} from './context';
import GoalForm from './GoalForm';
import { Button, Flex, message } from '@sue/design-web-react';
import { GoalService, GoalMapping } from '@true-north/web-service';

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
      <Flex vertical container="full">
        <Flex container="fill">
          <GoalForm />
        </Flex>
        <Flex container="fixed" className="w-full">
          <Footer />
        </Flex>
      </Flex>
    </GoalDetailProvider>
  );
}

function Footer() {
  const { goalFormData, onSubmit, onClose } = useGoalDetailContext();

  async function handleCreate(): Promise<boolean> {
    const goal = await GoalService.create(GoalMapping.formDataToCreateVo(goalFormData));
    return Boolean(goal);
  }

  return (
    <div className="flex justify-end gap-2">
      <Button onClick={() => onClose?.()}>取消</Button>
      <Button
        type="primary"
        onClick={async () => {
          if (!goalFormData.name) {
            message.error('请输入目标名称');
            return;
          }
          if (!(await handleCreate())) return;
          await onSubmit();
          onClose?.();
        }}
      >
        确认
      </Button>
    </div>
  );
}
