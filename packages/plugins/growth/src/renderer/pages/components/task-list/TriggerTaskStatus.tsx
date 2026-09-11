import { Checkbox } from '@sue/design-web-react';
import styles from './style.module.less';
import { TaskService } from '@true-north/web-service';
import { TaskWithoutRelationsVo } from '@true-north/vo';
import { emitTaskChanged } from '../../events';
import { TaskStatus } from '@true-north/enum';

export default function TriggerTaskStatus(props: {
  task: TaskWithoutRelationsVo;
  onChange: () => Promise<void>;
}) {
  const { task } = props;
  const isActive =
    task.status === TaskStatus.TODO || task.status === TaskStatus.DOING;

  return (
    <div
      className={`w-8 h-8 flex items-center ${styles['custom-checkbox-wrapper']}`}
    >
      <Checkbox
        checked={task.status === TaskStatus.DONE}
        disabled={!isActive}
        onChange={async () => {
          if (!isActive) return;
          await TaskService.markDone(task.id);
          emitTaskChanged();
          await props.onChange();
        }}
      />
    </div>
  );
}
