import { Checkbox, Modal } from '@arco-design/web-react';
import styles from './style.module.less';
import TodoService from '../../service/api';
import { Todo } from '../../service/types';

export default function DoneTodoCheckbox(props: {
  todo: {
    status: Todo['status'];
    id: string;
  };
  onChange: () => Promise<void>;
}) {
  return (
    <div
      className={`w-8 h-8 flex items-center ${styles['custom-checkbox-wrapper']}`}
    >
      <Checkbox
        checked={props.todo.status === 'done'}
        onChange={async () => {
          if (props.todo.status !== 'todo') {
            await TodoService.restoreTodo(props.todo.id);
            await props.onChange();
            return;
          }
          const todoSubTodoIdList = await TodoService.getTodoSubTodoIdList(
            props.todo.id
          );
          if (todoSubTodoIdList.length === 0) {
            await TodoService.batchDoneTodo([props.todo.id]);
            await props.onChange();
            return;
          }

          Modal.confirm({
            title: '完成待办',
            content: `完成待办后，将自动完成其所有子待办。`,
            onOk: async () => {
              await TodoService.batchDoneTodo([
                props.todo.id,
                ...todoSubTodoIdList,
              ]);
              await props.onChange();
            },
          });
        }}
      />
    </div>
  );
}
