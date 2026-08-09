import { AiProviderKind } from '@true-north/enum';

export type ProviderMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
};

export type ProviderCompleteResult = {
  content: string;
};

export interface AiProvider {
  kind: AiProviderKind;
  complete(req: ProviderCompleteRequest): Promise<ProviderCompleteResult>;
}
