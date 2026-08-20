import type {
  AiMessagePartVo,
  AiTextPartVo,
  MessageVo,
  RuntimeAgentVo,
  RuntimeSelectionVo,
} from '@true-north/vo';
import { AiPlatformError } from '../ai-error';
import { emitChatStreamEvent } from '../conversation/stream-bus';
import { spawnCodex } from './adapters/codex';
import { getLoopbackMcpUrl } from './mcp/loopback-server';
import { probeAllAgents, toRuntimeAgentVo } from './probe';
import { getRuntimeAgentDef } from './registry';
import { readSelectedRuntimeId, writeSelectedRuntimeId } from './selection-store';
import { bindStreamSession, unbindStreamSession } from './stream-session';
import type { RuntimeProbeResult, RuntimeSpawnInput, StreamSessionContext } from './types';
import { conversationWorkspaceDir } from './workspace';

function cloneParts(parts: AiMessagePartVo[]): AiMessagePartVo[] {
  return parts.map((part) => ({ ...part }));
}

function concatTextParts(parts: AiMessagePartVo[]): string {
  return parts
    .filter((part): part is AiTextPartVo => part.type === 'text')
    .map((part) => part.text || '')
    .join('');
}

function collectTextEntityLinks(parts: AiMessagePartVo[]): NonNullable<AiTextPartVo['entityLinks']> {
  const links: NonNullable<AiTextPartVo['entityLinks']> = [];
  for (const part of parts) {
    if (part.type === 'text') {
      links.push(...(part.entityLinks || []));
    }
  }
  return links;
}

function pickGrownText(current: string, incoming: string): string {
  if (current.startsWith(incoming) || incoming.startsWith(current)) {
    return current.length >= incoming.length ? current : incoming;
  }
  return current.length >= incoming.length ? current : incoming;
}

function mergePartsGrowText(current: AiMessagePartVo[], incoming: AiMessagePartVo[]): AiMessagePartVo[] {
  const currentText = concatTextParts(current);
  const incomingText = concatTextParts(incoming);
  const grown = pickGrownText(currentText, incomingText);
  const useCurrentLinks = grown === currentText && grown !== incomingText;
  const entityLinks = useCurrentLinks ? collectTextEntityLinks(current) : collectTextEntityLinks(incoming);
  const textPart: AiTextPartVo = entityLinks.length
    ? { type: 'text', text: grown, entityLinks }
    : { type: 'text', text: grown };

  const next: AiMessagePartVo[] = [];
  let insertedText = false;
  for (const part of incoming) {
    if (part.type === 'text') {
      if (!insertedText) {
        next.push(textPart);
        insertedText = true;
      }
    } else {
      next.push({ ...part });
    }
  }
  if (!insertedText && grown) {
    next.unshift(textPart);
  }
  return next;
}

function ensureTrailingText(parts: AiMessagePartVo[], text: string): AiMessagePartVo[] {
  const next = cloneParts(parts);
  const last = next[next.length - 1];
  if (last && last.type === 'text') {
    next[next.length - 1] = { ...last, text };
    return next;
  }
  next.push({ type: 'text', text });
  return next;
}

function appendDelta(parts: AiMessagePartVo[], delta: string): AiMessagePartVo[] {
  const next = cloneParts(parts);
  const last = next[next.length - 1];
  if (last && last.type === 'text') {
    next[next.length - 1] = { ...last, text: `${last.text || ''}${delta}` };
    return next;
  }
  next.push({ type: 'text', text: delta });
  return next;
}

function enqueueLock() {
  let chain = Promise.resolve();
  return <T,>(task: () => Promise<T> | T): Promise<T> => {
    const run = chain.then(task, task);
    chain = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  };
}

export function resolvePreferredAgent(probes: RuntimeProbeResult[]): RuntimeProbeResult | undefined {
  const saved = readSelectedRuntimeId();
  const savedProbe = saved ? probes.find((item) => item.id === saved) : undefined;
  if (savedProbe?.available) return savedProbe;
  return probes.find((item) => item.available) || savedProbe || probes[0];
}

export class RuntimeService {
  listAgents(): RuntimeAgentVo[] {
    return probeAllAgents().map(toRuntimeAgentVo);
  }

  getSelection(): RuntimeSelectionVo {
    return { runtimeId: readSelectedRuntimeId() };
  }

  putSelection(runtimeId: string): RuntimeSelectionVo {
    const def = getRuntimeAgentDef(runtimeId);
    if (!def) {
      throw AiPlatformError.agentUnavailable(`未知编码 Agent: ${runtimeId}`);
    }
    return { runtimeId: writeSelectedRuntimeId(def.id) };
  }

  resolveForSend(): RuntimeProbeResult {
    const probes = probeAllAgents();
    const selected = resolvePreferredAgent(probes);
    if (!selected) {
      throw AiPlatformError.agentUnavailable('没有可用的编码 Agent');
    }
    if (!selected.resolvedPath) {
      throw AiPlatformError.agentUnavailable(selected.unavailableReason || '未安装');
    }
    if (!selected.authenticated) {
      throw AiPlatformError.agentUnauthenticated(selected.unavailableReason || '未登录');
    }
    if (!selected.available) {
      throw AiPlatformError.agentUnavailable(selected.unavailableReason || '当前选择不可用');
    }
    return selected;
  }

  async runChat(input: {
    streamId: string;
    conversationId: string;
    assistantId: string;
    prompt: string;
    resumeThreadId?: string;
    signal: AbortSignal;
    persistParts: (parts: AiMessagePartVo[]) => Promise<MessageVo>;
  }): Promise<{ message: MessageVo; threadId?: string; runtimeId: string }> {
    const selected = this.resolveForSend();
    const def = getRuntimeAgentDef(selected.id);
    if (!def || !selected.resolvedPath) {
      throw AiPlatformError.agentUnavailable('当前选择不可用');
    }

    const enqueue = enqueueLock();
    let parts: AiMessagePartVo[] = [{ type: 'text', text: '' }];
    const ctx: StreamSessionContext = {
      streamId: input.streamId,
      conversationId: input.conversationId,
      assistantId: input.assistantId,
      parts,
      persistParts: async (incoming: AiMessagePartVo[]) => input.persistParts(incoming),
    };

    const persistCanonical = async (next: AiMessagePartVo[]) => {
      parts = next;
      ctx.parts = parts;
      return input.persistParts(parts);
    };
    ctx.persistParts = (incoming: AiMessagePartVo[]) =>
      enqueue(() => persistCanonical(mergePartsGrowText(parts, incoming)));
    await ctx.persistParts(ctx.parts);
    bindStreamSession(ctx);

    let threadId = input.resumeThreadId;
    const spawnInput: RuntimeSpawnInput = {
      streamId: input.streamId,
      def,
      binPath: selected.resolvedPath,
      workspaceDir: conversationWorkspaceDir(input.conversationId),
      mcpUrl: getLoopbackMcpUrl(input.streamId),
      prompt: input.prompt,
      resumeThreadId: input.resumeThreadId,
      signal: input.signal,
      onDelta: (delta) => {
        void enqueue(() => {
          parts = appendDelta(parts, delta);
          ctx.parts = parts;
          emitChatStreamEvent({ streamId: input.streamId, event: 'delta', delta });
        });
      },
      onThreadId: (id) => {
        threadId = id;
      },
    };

    let spawnResult: Awaited<ReturnType<typeof spawnCodex>>;
    try {
      spawnResult = await spawnCodex(spawnInput);
    } finally {
      unbindStreamSession(input.streamId);
    }
    threadId = spawnResult.threadId || threadId;
    await enqueue(() => undefined);

    if (input.signal.aborted) {
      const message = await enqueue(() => {
        const current = concatTextParts(parts);
        return persistCanonical(
          ensureTrailingText(parts, current.trim() ? `${current}\n\n（已停止生成）` : '（已停止生成）')
        );
      });
      return { message, threadId, runtimeId: def.id };
    }

    if (spawnResult.exitCode && spawnResult.exitCode !== 0) {
      const detail = spawnResult.stderr.trim().slice(0, 400);
      throw AiPlatformError.internal(detail || '编码 Agent 退出异常');
    }

    const message = await enqueue(() => {
      const hasContent = parts.some((part) => {
        if (part.type === 'text') return Boolean(part.text?.trim());
        return part.type === 'workspace' || part.type === 'tool';
      });
      return persistCanonical(hasContent ? parts : ensureTrailingText(parts, '（模型未返回内容）'));
    });
    return { message, threadId, runtimeId: def.id };
  }
}

export const runtimeService = new RuntimeService();
