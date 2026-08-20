import type { RefObject } from 'react';
import { Input, type GetRef } from '@sue/design-web-react';
import type {
  AiDecomposePayloadVo,
  AiEntityLinkVo,
  AiWorkspacePartVo,
  AiWorkspaceSuggestionVo,
  ConversationVo,
  MessageVo,
  RuntimeAgentVo,
} from '@true-north/vo';

export type ComposerInputRef = GetRef<typeof Input.TextArea>;

export type AiDraft = {
  text: string;
  links: AiEntityLinkVo[];
};

export type AiSessionContextValue = {
  conversations: ConversationVo[];
  activeConversationId: string | null;
  activeConversation: ConversationVo | undefined;
  activeMessages: MessageVo[];
  activeWorkspaceMessageId: string | null;
  activeWorkspacePart: AiWorkspacePartVo | null;
  draft: AiDraft;
  setDraft: (value: string | AiDraft) => void;
  composerInputRef: RefObject<ComposerInputRef>;
  focusComposer: () => void;
  streaming: boolean;
  streamingAssistantId: string | null;
  streamError: string | null;
  loading: boolean;
  goals: any[];
  tasks: any[];
  codingAgents: RuntimeAgentVo[];
  selectedAgentId: string;
  selectedAgent: RuntimeAgentVo | undefined;
  selectCodingAgent: (id: string) => Promise<void>;
  canSendWithSelectedAgent: boolean;
  threadWillReset: boolean;
  selectConversation: (id: string) => void;
  createBlankConversation: () => Promise<void>;
  sendUserMessage: () => Promise<void>;
  cancelStreaming: () => Promise<void>;
  openWorkspaceFromMessage: (messageId: string) => void;
  patchWorkspace: (
    messageId: string,
    suggestions: AiWorkspaceSuggestionVo[],
    analysisSummary?: string
  ) => Promise<boolean>;
  goalTitle: (goalId?: string) => string | undefined;
  taskTitle: (taskId?: string) => string | undefined;
  onOpenGoal: (goalId: string) => void;
  onOpenTask: (taskId: string) => void;
  findGoal: (goalId?: string) => any | undefined;
  findTask: (taskId?: string) => any | undefined;
};

export type WorkspaceHostProps = {
  payload: AiDecomposePayloadVo;
  messageId: string;
  goalId?: string;
  taskId?: string;
};
