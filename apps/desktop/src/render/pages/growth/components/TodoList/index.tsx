'use client';

import { TodoVo, TodoWithoutRelationsVo } from '@true-north/vo';
import TriggerTodoStatus from './TriggerTodoStatus';
import TodoItem from './TodoItem';
import styles from './style.module.less';

function TodoList(props: {
  todoList: TodoVo[];
  onClickTodo: (todo: TodoWithoutRelationsVo) => Promise<void>;
  refreshTodoList: () => Promise<void>;
}) {
  return (
    <div className={styles.list}>
      {props.todoList.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onClickTodo={props.onClickTodo}
          refreshTodoList={props.refreshTodoList}
          TriggerCheckbox={
            <TriggerTodoStatus todo={todo} onChange={props.refreshTodoList} />
          }
        />
      ))}
    </div>
  );
}

export default TodoList;
