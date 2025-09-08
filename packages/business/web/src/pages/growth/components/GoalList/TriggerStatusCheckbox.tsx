import { Checkbox, Modal } from '@arco-design/web-react';
import styles from './style.module.less';
import { GoalService } from '../../service';
import { GoalVo } from '@life-toolkit/vo/growth';

export default function TriggerStatusCheckbox(props: {
  goal: {
    status: GoalVo['status'];
    id: string;
  };
  onChange: () => Promise<void>;
}) {
  const { goal } = props;

  async function restore() {
    await GoalService.restoreGoal(goal.id);
    await props.onChange();
  }

  return (
    <div
      className={`w-8 h-8 flex items-center ${styles['custom-checkbox-wrapper']}`}
    >
      <Checkbox
        checked={goal.status === 'done'}
        onChange={async () => {
          if (goal.status !== 'todo') {
            await restore();
            return;
          }
          const { list: children } = await GoalService.getGoalList({
            parentId: goal.id,
          });

          if (children.length === 0) {
            await GoalService.doneBatchGoal({
              includeIds: [goal.id],
            });
            await props.onChange();
            return;
          }

          Modal.confirm({
            title: '完成目标',
            content: `完成目标后，将自动完成其所有子目标。`,
            onOk: async () => {
              await GoalService.doneBatchGoal({
                includeIds: [goal.id, ...children.map((child) => child.id)],
              });
              await props.onChange();
            },
          });
        }}
      />
    </div>
  );
}
