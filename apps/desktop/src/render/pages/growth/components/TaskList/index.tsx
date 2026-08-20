'use client';

import { TaskWithoutRelationsVo } from '@true-north/vo';
import TaskItem from './TaskItem';
import styles from './style.module.less';

function TaskList(props: {
  taskList: TaskWithoutRelationsVo[];
  onClickTask: (id: string) => Promise<void>;
  refreshTaskList: () => Promise<void>;
}) {
  return (
    <div className={styles.list}>
      {props.taskList.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onClickTask={props.onClickTask}
          refreshTaskList={props.refreshTaskList}
        />
      ))}
    </div>
  );
}

export default TaskList;
