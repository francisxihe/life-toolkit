import type { RuntimeAgentVo } from '@true-north/vo';
import type { AiMessagePartVo, MessageVo } from '@true-north/vo';

export type RuntimeAgentId = 'codex';

export type RuntimeAgentDef = {
  id: RuntimeAgentId;
  name: string;
  binaries: string[];
};

export type RuntimeProbeResult = RuntimeAgentVo & {
  resolvedPath?: string;
};

export type StreamSessionContext = {
  streamId: string;
  conversationId: string;
  assistantId: string;
  parts: AiMessagePartVo[];
  persistParts: (parts: AiMessagePartVo[]) => Promise<MessageVo>;
};

export type RuntimeSpawnInput = {
  streamId: string;
  def: RuntimeAgentDef;
  binPath: string;
  workspaceDir: string;
  mcpUrl: string;
  prompt: string;
  resumeThreadId?: string;
  signal: AbortSignal;
  onDelta: (text: string) => void;
  onThreadId: (threadId: string) => void;
};

export type RuntimeSpawnResult = {
  threadId?: string;
  exitCode: number | null;
  stderr: string;
};
