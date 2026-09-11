import type { AiConversationPurpose, AiMessageRole } from '@true-north/enum';

export type AiEntityLinkVo = {
  type: string;
  id: string;
  label: string;
};

export type AiTextPartVo = {
  type: 'text';
  text: string;
  entityLinks?: AiEntityLinkVo[];
};

export type AiWorkspaceKey = string;
export type AiWorkspacePayloadVo = Record<string, unknown>;

export type AiWorkspacePartVo = {
  type: 'workspace';
  workspaceKey: string;
  payload: AiWorkspacePayloadVo;
};

export function workspaceEntityRef(payload: AiWorkspacePayloadVo): AiEntityLinkVo | undefined {
  const ref = payload.ref;
  if (!ref || typeof ref !== 'object' || Array.isArray(ref)) return undefined;
  const candidate = ref as Record<string, unknown>;
  if (typeof candidate.type !== 'string' || typeof candidate.id !== 'string') return undefined;
  return {
    type: candidate.type,
    id: candidate.id,
    label: typeof candidate.label === 'string' ? candidate.label : candidate.id,
  };
}

export type AiToolPartStatus = 'running' | 'done' | 'error';

export type AiToolPartVo = {
  type: 'tool';
  toolName: string;
  argsSummary?: string;
  status: AiToolPartStatus;
  resultSummary?: string;
};

export type AiMessagePartVo = AiTextPartVo | AiWorkspacePartVo | AiToolPartVo;

export type ConversationPurpose = AiConversationPurpose | `${AiConversationPurpose}` | 'chat' | 'capture';

export type ConversationVo = {
  id: string;
  title: string;
  updatedAt: string;
  createdAt?: string;
  pinned: boolean;
  purpose?: ConversationPurpose;
  refType?: string;
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
  purpose?: ConversationPurpose;
};

export type RenameConversationRequestVo = {
  title: string;
};

export type PinConversationRequestVo = {
  pinned: boolean;
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
  payload: AiWorkspacePayloadVo;
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
