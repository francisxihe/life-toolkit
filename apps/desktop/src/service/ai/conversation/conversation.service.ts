import { randomUUID } from 'crypto';
import type { EntityManager } from 'typeorm';
import { AiMessageRole } from '@true-north/enum';
import type {
  AiEntityLinkVo,
  AiMessagePartVo,
  AiTextPartVo,
  AiWorkspacePartVo,
  ConversationVo,
  EnsureBoundConversationResponseVo,
  MessageVo,
  PatchConversationRuntimeRequestVo,
  PatchWorkspaceRequestVo,
  StartMessageStreamResponseVo,
} from '@true-north/vo';
import { workspaceEntityRef } from '@true-north/vo';
import { AiPlatformError } from '../ai-error';
import { entityResolverRegistry } from '../entity/entity-resolver.registry';
import { agentDef } from '../runtime/registry';
import { killChildProcess, runtimeService } from '../runtime';
import { AiConversation } from './conversation.entity';
import { AiConversationRepository } from './conversation.repository';
import { AiMessage } from './message.entity';
import { AiMessageRepository } from './message.repository';
import {
  cancelStream,
  emitStream,
  finishStream,
  registerStreamAbort,
} from './stream-bus';

const HISTORY_TURN_CAP = 20;
const HISTORY_CHAR_CAP = 12_000;
const DEFAULT_TITLE = '新会话';

function toIso(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function toConversationVo(entity: AiConversation): ConversationVo {
  return {
    id: entity.id,
    title: entity.title,
    updatedAt: toIso(entity.updatedAt),
    createdAt: toIso(entity.createdAt),
    pinned: Boolean(entity.pinned),
    purpose: entity.purpose || 'chat',
    refType: entity.refType || undefined,
    refId: entity.refId || undefined,
    runtimeId: entity.runtimeId || undefined,
  };
}

function toMessageVo(entity: AiMessage): MessageVo {
  return {
    id: entity.id,
    conversationId: entity.conversationId,
    role: entity.role as MessageVo['role'],
    parts: entity.parts || [],
    createdAt: toIso(entity.createdAt),
  };
}

function formatEntityLinks(links: AiEntityLinkVo[] | undefined): string {
  if (!links?.length) return '';
  return links.map((link) => `@${link.label} {${link.type}:${link.id}}`).join(', ');
}

function textFromParts(parts: AiMessagePartVo[]): string {
  const texts: string[] = [];
  for (const part of parts) {
    if (part.type === 'text') {
      const body = part.text || '';
      const refs = formatEntityLinks(part.entityLinks);
      texts.push(refs ? `${body}\n[引用: ${refs}]`.trim() : body);
    } else if (part.type === 'workspace') {
      const ref = workspaceEntityRef(part.payload);
      const refLabel = ref ? ` ${ref.type}:${ref.id} ${ref.label}` : '';
      const summary = typeof part.payload.analysisSummary === 'string' ? part.payload.analysisSummary : '';
      texts.push(`[工作台:${part.workspaceKey}${refLabel}] ${summary}`.trim());
    } else if (part.type === 'tool') {
      texts.push(`[工具:${part.toolName} ${part.status}] ${part.resultSummary || part.argsSummary || ''}`.trim());
    }
  }
  return texts.filter(Boolean).join('\n');
}

function buildHistoryExcerpt(history: AiMessage[]): string {
  const recent = history.slice(-HISTORY_TURN_CAP);
  const lines: string[] = [];
  let chars = 0;
  for (const item of recent) {
    const content = textFromParts(item.parts || []);
    if (!content.trim()) continue;
    const role = item.role === AiMessageRole.ASSISTANT ? 'Assistant' : 'User';
    const line = `${role}: ${content}`;
    if (chars + line.length > HISTORY_CHAR_CAP && lines.length > 0) break;
    lines.push(line);
    chars += line.length;
  }
  return lines.join('\n');
}

function buildRuntimePrompt(history: AiMessage[], resume: boolean, latestUserText: string): string {
  if (resume) return latestUserText;
  const excerpt = buildHistoryExcerpt(history);
  return excerpt || latestUserText;
}

export class ConversationService {
  constructor(
    private readonly conversationRepository = new AiConversationRepository(),
    private readonly messageRepository = new AiMessageRepository(),
  ) {}

  async list(): Promise<ConversationVo[]> {
    const list = await this.conversationRepository.findByFilter({});
    return list.map(toConversationVo);
  }

  async createBlank(title?: string, purpose?: 'chat' | 'capture'): Promise<ConversationVo> {
    const entity = new AiConversation();
    entity.title = (title || DEFAULT_TITLE).trim() || DEFAULT_TITLE;
    entity.pinned = false;
    entity.purpose = purpose || 'chat';
    const saved = await this.conversationRepository.create(entity);
    return toConversationVo(saved);
  }

  async ensureCaptureInbox(): Promise<ConversationVo> {
    const existing = await this.conversationRepository.findByFilter({ purpose: 'capture' });
    if (existing[0]) return toConversationVo(existing[0]);
    return this.createBlank('收集箱', 'capture');
  }

  async ensureBoundConversation(refType: string, refId: string): Promise<EnsureBoundConversationResponseVo> {
    const type = refType?.trim();
    const id = refId?.trim();
    if (!type) throw AiPlatformError.internal('缺少 refType');
    if (!id) throw AiPlatformError.internal('缺少 refId');
    const resolved = await entityResolverRegistry.resolve(type, id);
    const existing = await this.conversationRepository.findByFilter({ refType: type, refId: id });
    if (existing[0]) {
      return { conversation: toConversationVo(existing[0]), created: false };
    }
    const entity = new AiConversation();
    entity.title = `拆解：${resolved.name}`;
    entity.refType = type as 'goal' | 'task';
    entity.refId = id;
    entity.pinned = false;
    const saved = await this.conversationRepository.create(entity);
    return { conversation: toConversationVo(saved), created: true };
  }

  async ensureBoundGoal(goalId: string): Promise<EnsureBoundConversationResponseVo> {
    return this.ensureBoundConversation('goal', goalId);
  }

  async ensureBoundTask(taskId: string): Promise<EnsureBoundConversationResponseVo> {
    return this.ensureBoundConversation('task', taskId);
  }

  async rename(conversationId: string, title?: string): Promise<ConversationVo> {
    const nextTitle = title?.trim();
    if (!nextTitle) throw AiPlatformError.internal('会话标题不能为空');
    const conversation = await this.conversationRepository.find(conversationId);
    conversation.title = nextTitle;
    const saved = await this.conversationRepository.update(conversation);
    return toConversationVo(saved);
  }

  async pin(conversationId: string, pinned: boolean): Promise<ConversationVo> {
    const saved = await this.conversationRepository.setPinned(conversationId, pinned);
    return toConversationVo(saved);
  }

  async remove(conversationId: string): Promise<void> {
    await this.conversationRepository.find(conversationId);
    await this.messageRepository.softDeleteByFilter({ conversationId });
    await this.conversationRepository.softDelete(conversationId);
  }

  async patchRuntime(conversationId: string, body: PatchConversationRuntimeRequestVo): Promise<ConversationVo> {
    const runtimeId = body?.runtimeId?.trim();
    if (!runtimeId || !agentDef(runtimeId)) {
      throw AiPlatformError.agentUnavailable('未知编码 Agent');
    }
    const conversation = await this.conversationRepository.find(conversationId);
    if (conversation.runtimeId !== runtimeId) {
      conversation.runtimeThreadId = null;
    }
    conversation.runtimeId = runtimeId;
    conversation.updatedAt = new Date();
    const saved = await this.conversationRepository.update(conversation);
    return toConversationVo(saved);
  }

  async getMessages(conversationId: string): Promise<MessageVo[]> {
    await this.conversationRepository.find(conversationId);
    const list = await this.messageRepository.findByFilter({ conversationId });
    return list.map(toMessageVo);
  }

  async startMessageStream(
    conversationId: string,
    text: string,
    entityLinks?: AiEntityLinkVo[]
  ): Promise<StartMessageStreamResponseVo> {
    const trimmed = text?.trim();
    if (!trimmed) {
      throw AiPlatformError.internal('消息内容不能为空');
    }

    runtimeService.resolveForSend();

    const conversation = await this.conversationRepository.find(conversationId);
    const user = new AiMessage();
    user.conversationId = conversationId;
    user.role = AiMessageRole.USER;
    const userPart: AiTextPartVo = { type: 'text', text: trimmed };
    if (entityLinks?.length) {
      userPart.entityLinks = entityLinks;
    }
    user.parts = [userPart];
    const savedUser = await this.messageRepository.create(user);

    const assistant = new AiMessage();
    assistant.conversationId = conversationId;
    assistant.role = AiMessageRole.ASSISTANT;
    assistant.parts = [{ type: 'text', text: '' }];
    const savedAssistant = await this.messageRepository.create(assistant);

    conversation.updatedAt = new Date();
    await this.conversationRepository.update(conversation);

    const streamId = randomUUID();
    const signal = registerStreamAbort(streamId);

    void this.dispatchOutboundMessage({
      streamId,
      conversationId,
      assistantId: savedAssistant.id,
      signal,
    });

    return {
      user: toMessageVo(savedUser),
      assistant: toMessageVo(savedAssistant),
      streamId,
    };
  }

  cancelStream(streamId: string): { ok: true } {
    killChildProcess(streamId);
    cancelStream(streamId);
    return { ok: true };
  }

  async patchWorkspacePayload(
    messageId: string,
    body: PatchWorkspaceRequestVo,
    manager?: EntityManager
  ): Promise<MessageVo> {
    const payload = body?.payload;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw AiPlatformError.internal('缺少工作台载荷');
    }

    const apply = async (message: AiMessage) => {
      const parts = [...(message.parts || [])];
      const workspaceIndex = parts.findIndex((part) => part.type === 'workspace');
      if (workspaceIndex < 0) {
        throw AiPlatformError.internal('消息中不存在工作台块');
      }
      const workspace = parts[workspaceIndex] as AiWorkspacePartVo;
      parts[workspaceIndex] = {
        ...workspace,
        payload,
      };
      message.parts = parts;
      return message;
    };

    if (manager) {
      const repo = manager.getRepository(AiMessage);
      const message = await repo.findOne({ where: { id: messageId } });
      if (!message) throw AiPlatformError.internal('消息不存在');
      await repo.save(await apply(message));
      const conversationRepo = manager.getRepository(AiConversation);
      const conversation = await conversationRepo.findOne({ where: { id: message.conversationId } });
      if (conversation) {
        conversation.updatedAt = new Date();
        await conversationRepo.save(conversation);
      }
      return toMessageVo(message);
    }

    const message = await apply(await this.messageRepository.find(messageId));
    const saved = await this.messageRepository.update(message);
    const conversation = await this.conversationRepository.find(message.conversationId);
    conversation.updatedAt = new Date();
    await this.conversationRepository.update(conversation);
    return toMessageVo(saved);
  }

  private async dispatchOutboundMessage(input: {
    streamId: string;
    conversationId: string;
    assistantId: string;
    signal: AbortSignal;
  }): Promise<void> {
    const { streamId, conversationId, assistantId, signal } = input;
    try {
      const conversation = await this.conversationRepository.find(conversationId);
      const history = await this.messageRepository.findByFilter({ conversationId });
      const withoutPlaceholder = history.filter((item) => item.id !== assistantId);
      const latestUser = [...withoutPlaceholder].reverse().find((item) => item.role === AiMessageRole.USER);
      const latestUserText = latestUser ? textFromParts(latestUser.parts || []) : '';

      const persistParts = async (parts: AiMessagePartVo[]): Promise<MessageVo> => {
        const assistant = await this.messageRepository.find(assistantId);
        assistant.parts = parts.length ? parts : [{ type: 'text', text: '' }];
        const saved = await this.messageRepository.update(assistant);
        const vo = toMessageVo(saved);
        emitStream({ streamId, event: 'message', message: vo });
        return vo;
      };

      const selected = runtimeService.resolveForSend();
      const resume =
        conversation.runtimeId === selected.id && Boolean(conversation.runtimeThreadId?.trim());
      const result = await runtimeService.runChat({
        streamId,
        conversationId,
        assistantId,
        prompt: buildRuntimePrompt(withoutPlaceholder, resume, latestUserText),
        resumeThreadId: resume ? conversation.runtimeThreadId || undefined : undefined,
        signal,
        persistParts,
      });

      const latest = await this.conversationRepository.find(conversationId);
      latest.runtimeId = result.runtimeId;
      if (result.threadId) latest.runtimeThreadId = result.threadId;
      latest.updatedAt = new Date();
      await this.conversationRepository.update(latest);
      emitStream({ streamId, event: 'done', message: result.message });
    } catch (error) {
      const code =
        error instanceof AiPlatformError
          ? error.aiCode
          : error instanceof Error && error.name === 'AbortError'
            ? 'TIMEOUT'
            : 'INTERNAL';
      const messageText = error instanceof Error ? error.message : '会话处理失败';
      try {
        const assistant = await this.messageRepository.find(assistantId);
        assistant.parts = [{ type: 'text', text: `生成失败：${messageText}` }];
        await this.messageRepository.update(assistant);
      } catch {
        // ignore
      }
      emitStream({ streamId, event: 'error', code, messageText });
    } finally {
      finishStream(streamId);
      killChildProcess(streamId);
    }
  }
}

export const conversationService = new ConversationService();
