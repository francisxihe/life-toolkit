'use client';

import { TaskVo } from '@life-toolkit/vo/task';
import TriggerStatusCheckbox from './TriggerStatusCheckbox';
import TaskItem from './TaskItem';

function TaskList(props: {
  taskList: TaskVo[];
  onClickTask: (id: string) => Promise<void>;
  refreshTaskList: () => Promise<void>;
}) {
  return (
    <div className="w-full mt-[-8px]">
      {props.taskList.map((todo) => (
        <TaskItem
          key={todo.id}
          todo={todo}
          onClickTask={props.onClickTask}
          refreshTaskList={props.refreshTaskList}
          TriggerCheckbox={
            <TriggerStatusCheckbox
              todo={todo}
              type="todo"
              onChange={props.refreshTaskList}
            />
          }
        />
      ))}
    </div>
  );
}

export default TaskList;
