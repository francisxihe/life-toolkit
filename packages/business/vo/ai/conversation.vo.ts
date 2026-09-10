import type { AiMessageRole } from '@true-north/enum';
import type { AiSuggestionVo } from './goal-decompose.vo';

export type AiEntityLinkVo = {
  type: 'goal' | 'task';
  id: string;
  label: string;
};

export type AiTextPartVo = {
  type: 'text';
  text: string;
  entityLinks?: AiEntityLinkVo[];
};

export type AiWorkspaceKey = 'goal.decompose' | 'task.decompose';

export type AiWorkspaceSuggestionVo = AiSuggestionVo & {
  /** 持久化已采纳 */
  accepted?: boolean;
};

export type AiDecomposePayloadVo = {
  runId?: string;
  analysisSummary: string;
  suggestions: AiWorkspaceSuggestionVo[];
  /** 工作台绑定的业务实体，自包含不依赖会话 */
  ref?: AiEntityLinkVo;
};

export type AiWorkspacePartVo = {
  type: 'workspace';
  workspaceKey: AiWorkspaceKey;
  payload: AiDecomposePayloadVo;
};

export type AiToolPartStatus = 'running' | 'done' | 'error';

export type AiToolPartVo = {
  type: 'tool';
  toolName: string;
  argsSummary?: string;
  status: AiToolPartStatus;
  resultSummary?: string;
};

export type AiMessagePartVo = AiTextPartVo | AiWorkspacePartVo | AiToolPartVo;

export type ConversationRefType = 'goal' | 'task';

export type ConversationVo = {
  id: string;
  title: string;
  updatedAt: string;
  createdAt?: string;
  refType?: ConversationRefType;
  refId?: string;
  runtimeId?: string;
};

export type MessageVo = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | `${AiMessageRole.USER}` | `${AiMessageRole.ASSISTANT}`;
  parts: AiMessagePartVo[];
  createdAt: string;
};

export type CreateConversationRequestVo = {
  title?: string;
};

export type RenameConversationRequestVo = {
  title: string;
};

export type StartMessageStreamRequestVo = {
  text: string;
  entityLinks?: AiEntityLinkVo[];
};

export type StartMessageStreamResponseVo = {
  user: MessageVo;
  assistant: MessageVo;
  streamId: string;
};

export type PatchWorkspaceRequestVo = {
  suggestions: AiWorkspaceSuggestionVo[];
  analysisSummary?: string;
};

export type CancelStreamResponseVo = {
  ok: true;
};

export type AiChatStreamDeltaEventVo = {
  streamId: string;
  event: 'delta';
  delta: string;
};

export type AiChatStreamMessageEventVo = {
  streamId: string;
  event: 'message';
  message: MessageVo;
};

export type AiChatStreamDoneEventVo = {
  streamId: string;
  event: 'done';
  message: MessageVo;
};

export type AiChatStreamErrorEventVo = {
  streamId: string;
  event: 'error';
  code: string;
  messageText: string;
};

export type AiChatStreamEventVo =
  | AiChatStreamDeltaEventVo
  | AiChatStreamMessageEventVo
  | AiChatStreamDoneEventVo
  | AiChatStreamErrorEventVo;

/** preload / main 推送频道名 */
export const AI_CONVERSATION_STREAM_CHANNEL = 'ai.conversation.stream';
