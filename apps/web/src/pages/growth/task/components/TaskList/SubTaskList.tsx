'use client';

import { TaskVo } from '@life-toolkit/vo/growth';
import TriggerStatusCheckbox from './TriggerStatusCheckbox';
import TaskItem from './TaskItem';

function SubTaskList(props: {
  taskList: TaskVo[];
  onClickTask: (id: string) => Promise<void>;
  refreshTaskList: () => Promise<void>;
}) {
  return (
    <div className='w-full'>
      {props.taskList.map((todo) => (
        <TaskItem
          key={todo.id}
          todo={todo}
          onClickTask={props.onClickTask}
          refreshTaskList={props.refreshTaskList}
          TriggerCheckbox={
            <TriggerStatusCheckbox
              todo={todo}
              type="sub-todo"
              onChange={async () => {
                await props.refreshTaskList();
              }}
            />
          }
        />
      ))}
    </div>
  );
}

export default SubTaskList;
