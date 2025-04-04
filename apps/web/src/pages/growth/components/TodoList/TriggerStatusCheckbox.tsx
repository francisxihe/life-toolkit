import { Checkbox, Modal } from '@arco-design/web-react';
import styles from './style.module.less';
import { TodoService } from '../../service';
import { TodoVo } from '@life-toolkit/vo/growth';

export default function TriggerStatusCheckbox(props: {
  todo: {
    status: TodoVo['status'];
    id: string;
  };
  type: 'todo' | 'sub-todo';
  onChange: () => Promise<void>;
}) {
  const { todo } = props;

  async function restore() {
    await TodoService.restoreTodo(todo.id);
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
          await TodoService.batchDoneTodo({
            idList: [todo.id],
          });
          await props.onChange();
        }}
      />
    </div>
  );
}
