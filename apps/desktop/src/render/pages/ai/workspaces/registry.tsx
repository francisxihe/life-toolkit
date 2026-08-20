import type { ComponentType } from 'react';
import type { AiDecomposePayloadVo, AiWorkspaceKey, AiWorkspaceSuggestionVo } from '@true-north/vo';
import { GoalDecomposeWorkspace } from './GoalDecomposeWorkspace';
import { TaskDecomposeWorkspace } from './TaskDecomposeWorkspace';

export type WorkspaceComponentProps = {
  payload: AiDecomposePayloadVo;
  messageId: string;
  goalId?: string;
  taskId?: string;
  goal?: any;
  task?: any;
  setDraft: (value: string) => void;
  patchWorkspace: (
    messageId: string,
    suggestions: AiWorkspaceSuggestionVo[],
    analysisSummary?: string
  ) => Promise<boolean>;
};

function GoalWorkspaceAdapter(props: WorkspaceComponentProps) {
  return (
    <GoalDecomposeWorkspace
      payload={props.payload}
      messageId={props.messageId}
      goalId={props.goalId}
      goal={props.goal}
      setDraft={props.setDraft}
      patchWorkspace={props.patchWorkspace}
    />
  );
}

function TaskWorkspaceAdapter(props: WorkspaceComponentProps) {
  return (
    <TaskDecomposeWorkspace
      payload={props.payload}
      messageId={props.messageId}
      taskId={props.taskId}
      task={props.task}
      setDraft={props.setDraft}
      patchWorkspace={props.patchWorkspace}
    />
  );
}

export const workspaceRegistry: Record<AiWorkspaceKey, ComponentType<WorkspaceComponentProps>> = {
  'goal.decompose': GoalWorkspaceAdapter,
  'task.decompose': TaskWorkspaceAdapter,
};
