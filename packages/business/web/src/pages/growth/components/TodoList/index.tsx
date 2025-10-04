'use client';

import { TodoVo, TodoWithoutRelationsVo } from '@life-toolkit/vo';
import TriggerStatusCheckbox from './TriggerStatusCheckbox';
import TodoItem from './TodoItem';

function TodoList(props: {
  todoList: TodoVo[];
  onClickTodo: (todo: TodoWithoutRelationsVo) => Promise<void>;
  refreshTodoList: () => Promise<void>;
}) {
  return (
    <div className="w-full mt-[-8px]">
      {props.todoList.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onClickTodo={props.onClickTodo}
          refreshTodoList={props.refreshTodoList}
          TriggerCheckbox={
            <TriggerStatusCheckbox
              todo={todo}
              type="todo"
              onChange={props.refreshTodoList}
            />
          }
        />
      ))}
    </div>
  );
}

export default TodoList;
