import { Checkbox, Modal } from '@arco-design/web-react';
import styles from './style.module.less';
import TodoService from '../../service';
import { TodoVo } from '@life-toolkit/vo/todo';

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
    if (props.type === 'todo') {
      await TodoService.restoreTodo(todo.id);
    } else {
      await TodoService.restoreSubTodo(todo.id);
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
          const todoSubTodoList = await TodoService.getSubTodoList({
            parentId: todo.id,
          });

          if (todoSubTodoList.length === 0) {
            await TodoService.batchDoneTodo({
              idList: [todo.id],
            });
            await props.onChange();
            return;
          }

          Modal.confirm({
            title: '完成待办',
            content: `完成待办后，将自动完成其所有子待办。`,
            onOk: async () => {
              await TodoService.batchDoneTodo({
                idList: [
                  todo.id,
                  ...todoSubTodoList.map((subTodo) => subTodo.id),
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
