import { TaskDetailProvider } from './context';
import { TaskDetailLayout } from './features/TaskDetailLayout';
import type { DrawerState, Goal, Task, Todo } from '../../shared/types';
import { Drawer } from '@sue/design-web-react';

type Props = {
  taskId: string;
  tasks: Task[];
  goals: Goal[];
  todos: Todo[];
  updateTask: (id: string, patch: Partial<Task>) => void;
  createTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  setDrawer: (drawer: DrawerState) => void;
  onFocusTask: (task: Task) => void;
  onClose: () => void;
  notify: (text: string) => void;
  onOpenAiDecomposition: () => void;
};

export function TaskDetailDrawer({ taskId, onClose, ...props }: Props) {
  return (
    <Drawer open title="任务详情" size="large" destroyOnHidden onClose={onClose}>
      <TaskDetailProvider initialTaskId={taskId} onClose={onClose} {...props}><TaskDetailLayout /></TaskDetailProvider>
    </Drawer>
  );
}
