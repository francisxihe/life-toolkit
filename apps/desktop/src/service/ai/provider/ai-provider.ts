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
