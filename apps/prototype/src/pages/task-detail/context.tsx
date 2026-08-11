import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DrawerState, Goal, Task, Todo } from '../../shared/types';

type TaskDetailContextValue = {
  goals: Goal[];
  tasks: Task[];
  todos: Todo[];
  currentTask: Task;
  selectedTaskId: string;
  setSelectedTaskId: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  createTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  setDrawer: (drawer: DrawerState) => void;
  onFocusTask: (task: Task) => void;
  onClose: () => void;
  notify: (text: string) => void;
  onOpenAiDecomposition: () => void;
};

const TaskDetailContext = createContext<TaskDetailContextValue | null>(null);

type Props = Omit<TaskDetailContextValue, 'currentTask' | 'selectedTaskId' | 'setSelectedTaskId'> & { initialTaskId: string; children: React.ReactNode };

export function TaskDetailProvider({ initialTaskId, tasks, children, ...value }: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId);
  useEffect(() => setSelectedTaskId(initialTaskId), [initialTaskId]);
  const currentTask = tasks.find((task) => task.id === selectedTaskId) || tasks.find((task) => task.id === initialTaskId);
  const contextValue = useMemo(
    () => currentTask ? { ...value, tasks, currentTask, selectedTaskId: currentTask.id, setSelectedTaskId } : null,
    [currentTask, selectedTaskId, tasks, value],
  );
  if (!contextValue) return null;
  return <TaskDetailContext.Provider value={contextValue}>{children}</TaskDetailContext.Provider>;
}

export function useTaskDetailContext() {
  const context = useContext(TaskDetailContext);
  if (!context) throw new Error('TaskDetailProvider is required');
  return context;
}
