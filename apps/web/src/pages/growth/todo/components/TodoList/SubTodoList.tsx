'use client';

import { SubTodoVo } from '@life-toolkit/vo/todo';
import TriggerStatusCheckbox from './TriggerStatusCheckbox';
import TodoItem from './TodoItem';

function SubTodoList(props: {
  todoList: SubTodoVo[];
  onClickTodo: (id: string) => Promise<void>;
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
              type="sub-todo"
              onChange={async () => {
                await props.refreshTodoList();
              }}
            />
          }
        />
      ))}
    </div>
  );
}

export default SubTodoList;
