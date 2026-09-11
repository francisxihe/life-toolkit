import type { ComponentType } from 'react';
import type {
  AiWorkspacePayloadVo,
  BrowserExtractResultVo,
  MessageVo,
} from '@true-north/vo';

export type WorkbenchHostActions = {
  updatePayload: (payload: AiWorkspacePayloadVo) => Promise<boolean>;
  requestFollowUp: (text: string) => void;
};

export type WorkbenchToolProps<TPayload = AiWorkspacePayloadVo> = {
  payload: TPayload;
  messageId: string;
  conversationId: string;
  actions: WorkbenchHostActions;
};

export type WorkbenchToolDefinition<TPayload = AiWorkspacePayloadVo> = {
  workspaceKey: string;
  title: (payload: TPayload) => string;
  entryLabel: (payload: TPayload) => string;
  autoOpen?: (input: { payload: TPayload; message: MessageVo; force: boolean }) => boolean;
  parsePayload: (payload: AiWorkspacePayloadVo) => TPayload;
  Component: ComponentType<WorkbenchToolProps<TPayload>>;
};

export type WorkbenchWorkspaceHost = {
  load(
    conversationId: string,
    messageId: string
  ): Promise<{ workspaceKey: string; payload: AiWorkspacePayloadVo }>;
  subscribe(
    messageId: string,
    onUpdate: (next: { workspaceKey: string; payload: AiWorkspacePayloadVo }) => void
  ): () => void;
  patch(messageId: string, payload: AiWorkspacePayloadVo): Promise<AiWorkspacePayloadVo>;
};

export type WorkbenchExtractHandler = (input: {
  result: BrowserExtractResultVo;
  url: string;
}) => Promise<void>;

export type WorkbenchToolRegistry = {
  find(key: string): WorkbenchToolDefinition | undefined;
  all: WorkbenchToolDefinition[];
};

export function createWorkbenchToolRegistry(
  definitions: WorkbenchToolDefinition[]
): WorkbenchToolRegistry {
  const map = new Map<string, WorkbenchToolDefinition>();
  for (const definition of definitions) {
    if (map.has(definition.workspaceKey)) {
      throw new Error(`重复注册工作台工具: ${definition.workspaceKey}`);
    }
    map.set(definition.workspaceKey, definition);
  }
  return {
    find(key: string) {
      return map.get(key);
    },
    all: definitions,
  };
}
