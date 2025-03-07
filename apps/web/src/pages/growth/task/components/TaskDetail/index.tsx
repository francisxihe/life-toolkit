import FlexibleContainer from '@/components/FlexibleContainer';
import { TaskVo } from '@life-toolkit/vo/growth';
import { TaskDetailProvider } from './context';
import TaskForm from './TaskForm';
import SubTaskList from './SubTaskList';
import TodoList from './TodoList';
import { Drawer } from '@arco-design/web-react';
import { useState } from 'react';
import { DrawerProps } from '@arco-design/web-react/es/drawer';
const { Shrink, Fixed } = FlexibleContainer;

export type TaskDetailProps = {
  task: TaskVo;
  onClose: () => Promise<void>;
  onChange: (task: TaskVo) => Promise<void>;
};

export default function TaskDetail(props: TaskDetailProps) {
  return (
    <TaskDetailProvider
      task={props.task}
      onClose={props.onClose}
      onChange={props.onChange}
    >
      <FlexibleContainer>
        <Fixed>
          <TaskForm />
        </Fixed>
        <Shrink absolute>
          <div className="h-1/2 overflow-hidden">
            <SubTaskList />
          </div>
          <div className="h-1/2 overflow-hidden">
            <TodoList />
          </div>
        </Shrink>
      </FlexibleContainer>
    </TaskDetailProvider>
  );
}

export function useTaskDetailDrawer(props: DrawerProps) {
  const [visible, setVisible] = useState(false);
  const [drawerProps, setDrawerProps] = useState<TaskDetailProps>();

  const open = (props: TaskDetailProps) => {
    setDrawerProps(props);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  const TaskDetailDrawer = () => {
    return (
      <Drawer visible={visible} width={800} {...props}>
        {drawerProps && <TaskDetail {...drawerProps} />}
      </Drawer>
    );
  };

  return {
    open,
    close,
    TaskDetailDrawer,
  };
}
