import { Checkbox, Modal } from '@arco-design/web-react';
import styles from './style.module.less';
import TodoService from '../../service';
import { TodoVO } from '@life-toolkit/vo/todo/todo';

export default function DoneTodoCheckbox(props: {
  todo: {
    status: TodoVO['status'];
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
          
          const todoSubTodoList = await TodoService.getSubTodoList({
            parentId: props.todo.id,
          });

          if (todoSubTodoList.length === 0) {
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
                ...todoSubTodoList.map((todo) => todo.id),
              ]);
              await props.onChange();
            },
          });
        }}
      />
    </div>
  );
}
