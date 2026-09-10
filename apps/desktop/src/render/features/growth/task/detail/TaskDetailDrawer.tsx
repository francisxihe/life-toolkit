import { Drawer, Empty, Flex, Spin } from '@sue/design-web-react';
import { useEffect, useState } from 'react';
import { TaskDetailProvider, useTaskDetailContext } from './context';
import TaskAside from './TaskAside';
import TaskMain from './TaskMain';
import { TaskEditor } from '../../components/TaskDetail';
import styles from './style.module.less';

type OpenTaskDetailDrawerOptions = {
  taskId: string;
  onRefresh?: () => Promise<void> | void;
};

type TaskDrawerController = ReturnType<typeof Drawer.useDrawer>[0];

let taskDrawerController: TaskDrawerController | null = null;
let pendingDrawerOptions: OpenTaskDetailDrawerOptions | null = null;

/** Renders task detail drawers within the app's existing provider and router tree. */
export function TaskDetailDrawerHost() {
  const [drawer, drawerContextHolder] = Drawer.useDrawer();

  useEffect(() => {
    taskDrawerController = drawer;
    if (pendingDrawerOptions) {
      const options = pendingDrawerOptions;
      pendingDrawerOptions = null;
      openTaskDetailDrawer(options);
    }

    return () => {
      if (taskDrawerController === drawer) {
        taskDrawerController = null;
      }
    };
  }, [drawer]);

  return drawerContextHolder;
}

/** Opens task details in the current page instead of navigating to a detail route. */
export function openTaskDetailDrawer({ taskId, onRefresh }: OpenTaskDetailDrawerOptions) {
  if (!taskDrawerController) {
    pendingDrawerOptions = { taskId, onRefresh };
    return { destroy: () => { pendingDrawerOptions = null; } };
  }

  let instance: ReturnType<typeof Drawer.open>;
  instance = taskDrawerController.open({
    title: '任务详情',
    size: 1100,
    content: (
      <TaskDetailProvider taskId={taskId} onRefresh={async () => onRefresh?.()}>
        <TaskDetailDrawerContent onClose={() => instance.destroy()} />
      </TaskDetailProvider>
    ),
  });
  return instance;
}

function TaskDetailDrawerContent({ onClose }: { onClose: () => void }) {
  const { currentTask, loading, refreshData } = useTaskDetailContext();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [currentTask?.id]);

  if (loading && !currentTask) {
    return <Flex container="full" justify="center" align="center"><Spin /></Flex>;
  }
  if (!currentTask) {
    return <Flex container="full" justify="center" align="center"><Empty description="任务不存在或已被删除" /></Flex>;
  }

  return (
    <Flex container="full" className={styles.drawerBody}>
      <Flex container="fixed" className={styles.aside}>
        <TaskAside currentTaskId={currentTask.id} />
      </Flex>
      <Flex container="fill">
        {editing ? (
          <TaskEditor
            task={currentTask}
            afterSubmit={async () => {
              await refreshData();
              setEditing(false);
            }}
            onClose={() => setEditing(false)}
          />
        ) : (
          <TaskMain
            task={currentTask}
            onDeleted={onClose}
            onEdit={() => setEditing(true)}
          />
        )}
      </Flex>
    </Flex>
  );
}
