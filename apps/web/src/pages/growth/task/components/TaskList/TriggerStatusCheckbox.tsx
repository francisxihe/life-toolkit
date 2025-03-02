import { Checkbox, Modal } from '@arco-design/web-react';
import styles from './style.module.less';
import TaskService from '../../service';
import { TaskVo } from '@life-toolkit/vo/growth';

export default function TriggerStatusCheckbox(props: {
  todo: {
    status: TaskVo['status'];
    id: string;
  };
  type: 'todo' | 'sub-todo';
  onChange: () => Promise<void>;
}) {
  const { todo } = props;

  async function restore() {
    if (props.type === 'todo') {
      await TaskService.restoreTask(todo.id);
    } else {
      await TaskService.restoreSubTask(todo.id);
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
          const todoSubTaskList = await TaskService.getSubTaskList({
            parentId: todo.id,
          });

          if (todoSubTaskList.length === 0) {
            await TaskService.batchDoneTask({
              idList: [todo.id],
            });
            await props.onChange();
            return;
          }

          Modal.confirm({
            title: '完成任务',
            content: `完成任务后，将自动完成其所有子任务。`,
            onOk: async () => {
              await TaskService.batchDoneTask({
                idList: [
                  todo.id,
                  ...todoSubTaskList.map((subTask) => subTask.id),
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
