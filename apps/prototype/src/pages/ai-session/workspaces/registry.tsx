import type { ComponentType } from 'react';
import type {
  AiWorkspaceKey,
  DecomposePayload,
  Goal,
  GoalDecomposePayload,
  SaveEntity,
  Task,
  TaskDecomposePayload,
} from '../../../shared/types';
import { GoalDecomposeWorkspace } from './GoalDecomposeWorkspace';
import { TaskDecomposeWorkspace } from './TaskDecomposeWorkspace';

export type WorkspaceComponentProps = {
  payload: DecomposePayload;
  goalId?: string;
  taskId?: string;
  goals: Goal[];
  tasks: Task[];
  saveEntity: SaveEntity;
  setDraft: (value: string) => void;
};

function GoalWorkspaceAdapter(props: WorkspaceComponentProps) {
  return (
    <GoalDecomposeWorkspace
      payload={props.payload as GoalDecomposePayload}
      goalId={props.goalId}
      goals={props.goals}
      saveEntity={props.saveEntity}
      setDraft={props.setDraft}
    />
  );
}

function TaskWorkspaceAdapter(props: WorkspaceComponentProps) {
  return (
    <TaskDecomposeWorkspace
      payload={props.payload as TaskDecomposePayload}
      taskId={props.taskId}
      tasks={props.tasks}
      saveEntity={props.saveEntity}
      setDraft={props.setDraft}
    />
  );
}

export const workspaceRegistry: Record<AiWorkspaceKey, ComponentType<WorkspaceComponentProps>> = {
  'goal.decompose': GoalWorkspaceAdapter,
  'task.decompose': TaskWorkspaceAdapter,
};
