import { Checkbox, Modal } from '@arco-design/web-react';
import styles from './style.module.less';
import GoalService from '../../service';
import { GoalVo } from '@life-toolkit/vo/growth';

export default function TriggerStatusCheckbox(props: {
  todo: {
    status: GoalVo['status'];
    id: string;
  };
  type: 'todo' | 'sub-todo';
  onChange: () => Promise<void>;
}) {
  const { todo } = props;

  async function restore() {
    if (props.type === 'todo') {
      await GoalService.restoreGoal(todo.id);
    } else {
      await GoalService.restoreSubGoal(todo.id);
    }
    await props.onChange();
  }

  return (
    <div
      className={`w-8 h-8 flex items-center ${styles['custom-checkbox-wrapper']}`}
    >
      <Checkbox
        checked={todo.status === 'done'}
        onChange={async () => {
          if (todo.status !== 'todo') {
            await restore();
            return;
          }
          console.log('todo.id', todo.id);
          const todoSubGoalList = await GoalService.getSubGoalList({
            parentId: todo.id,
          });

          if (todoSubGoalList.length === 0) {
            await GoalService.batchDoneGoal({
              idList: [todo.id],
            });
            await props.onChange();
            return;
          }

          Modal.confirm({
            title: '完成目标',
            content: `完成目标后，将自动完成其所有子目标。`,
            onOk: async () => {
              await GoalService.batchDoneGoal({
                idList: [
                  todo.id,
                  ...todoSubGoalList.map((subGoal) => subGoal.id),
                ],
              });
              await props.onChange();
            },
          });
        }}
      />
    </div>
  );
}
