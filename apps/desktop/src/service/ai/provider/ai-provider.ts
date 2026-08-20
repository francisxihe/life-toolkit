import { AiProviderKind } from '@true-north/enum';

export type ProviderToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type ProviderTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ProviderMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ProviderToolCall[];
  toolCallId?: string;
};

export type ProviderCompleteRequest = {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ProviderMessage[];
  timeoutMs: number;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  signal?: AbortSignal;
  tools?: ProviderTool[];
};

export type ProviderCompleteResult = {
  content: string;
};

export type ProviderStreamTextChunk = {
  type: 'text';
  delta: string;
};

export type ProviderStreamFinishChunk = {
  type: 'finish';
  finishReason: string;
  toolCalls?: ProviderToolCall[];
};

export type ProviderStreamChunk = ProviderStreamTextChunk | ProviderStreamFinishChunk;

export interface AiProvider {
  kind: AiProviderKind;
  complete(req: ProviderCompleteRequest): Promise<ProviderCompleteResult>;
  stream?(req: ProviderCompleteRequest): AsyncIterable<ProviderStreamChunk>;
}
