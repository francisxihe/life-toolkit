import type { RefObject } from 'react';
import { Input, type GetRef } from '@sue/design-web-react';
import type {
  AiEntityLinkVo,
  ConversationVo,
  MessageVo,
  RuntimeAgentVo,
} from '@true-north/vo';
import type { AiEntityRecord, AiEntitySource } from './entity-source';

export type ComposerInputRef = GetRef<typeof Input.TextArea>;

export type AiDraft = {
  text: string;
  links: AiEntityLinkVo[];
};

export type SessionValue = {
  conversations: ConversationVo[];
  activeConversationId: string | null;
  activeConversation: ConversationVo | undefined;
  activeMessages: MessageVo[];
  draft: AiDraft;
  setDraft: (value: string | AiDraft) => void;
  composerInputRef: RefObject<ComposerInputRef>;
  focusComposer: () => void;
  streaming: boolean;
  streamingAssistantId: string | null;
  streamError: string | null;
  loading: boolean;
  entities: AiEntityRecord[];
  entitySources: AiEntitySource[];
  codingAgents: RuntimeAgentVo[];
  selectedAgentId: string;
  selectedAgent: RuntimeAgentVo | undefined;
  selectCodingAgent: (id: string) => Promise<void>;
  canSend: boolean;
  threadWillReset: boolean;
  selectConversation: (id: string) => void;
  createBlankConversation: () => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<boolean>;
  pinConversation: (id: string, pinned: boolean) => Promise<boolean>;
  deleteConversation: (id: string) => Promise<void>;
  sendUserMessage: () => Promise<void>;
  cancelStreaming: () => Promise<void>;
  openWorkspace: (messageId: string) => void;
  openEntity: (type: string, id: string) => void;
  boundLabel: (refType?: string, refId?: string) => string;
};
