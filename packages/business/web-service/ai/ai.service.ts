import type {
  AiChatStreamEventVo,
  CancelStreamResponseVo,
  ConversationVo,
  CreateConversationRequestVo,
  EnsureBoundConversationResponseVo,
  EnsureBoundGoalRequestVo,
  EnsureBoundTaskRequestVo,
  GoalDecomposeRequestVo,
  GoalDecomposeResponseVo,
  MessageVo,
  PatchConversationRuntimeRequestVo,
  PatchWorkspaceRequestVo,
  PinConversationRequestVo,
  PutRuntimeSelectionRequestVo,
  RenameConversationRequestVo,
  RuntimeAgentVo,
  RuntimeSelectionVo,
  StartMessageStreamRequestVo,
  StartMessageStreamResponseVo,
  TaskDecomposeRequestVo,
  TaskDecomposeResponseVo,
} from '@true-north/vo';
import { AI_CONVERSATION_STREAM_CHANNEL } from '@true-north/vo';
import AiController from '../controller/ai';
import { aiErrorUserMessage, parseAiError } from './parse-ai-error';

export type AiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ReturnType<typeof parseAiError>['code']; message: string };

async function wrap<T>(fn: () => Promise<T>): Promise<AiResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error: unknown) {
    const parsed = parseAiError(error);
    return {
      ok: false,
      code: parsed.code,
      message: aiErrorUserMessage(parsed.code, parsed.message),
    };
  }
}

type StreamHandler = (event: AiChatStreamEventVo) => void;

const streamListeners = new Set<StreamHandler>();
let bridgeAttached = false;
let bridgeListener: ((...args: any[]) => void) | null = null;

function ensureStreamBridge() {
  if (bridgeAttached) return;
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  if (!api?.on) return;
  bridgeListener = (_event: unknown, payload: AiChatStreamEventVo) => {
    for (const handler of streamListeners) {
      try {
        handler(payload);
      } catch {
        // ignore handler errors
      }
    }
  };
  api.on(AI_CONVERSATION_STREAM_CHANNEL, bridgeListener);
  bridgeAttached = true;
}

export default class AiService {
  static async listRuntimeAgents(): Promise<AiResult<RuntimeAgentVo[]>> {
    return wrap(() => AiController.listRuntimeAgents());
  }

  static async getRuntimeSelection(): Promise<AiResult<RuntimeSelectionVo>> {
    return wrap(() => AiController.getRuntimeSelection());
  }

  static async putRuntimeSelection(body: PutRuntimeSelectionRequestVo): Promise<AiResult<RuntimeSelectionVo>> {
    return wrap(() => AiController.putRuntimeSelection(body));
  }

  static async decomposeGoal(body: GoalDecomposeRequestVo): Promise<AiResult<GoalDecomposeResponseVo>> {
    return wrap(() => AiController.decomposeGoal(body));
  }

  static async decomposeTask(body: TaskDecomposeRequestVo): Promise<AiResult<TaskDecomposeResponseVo>> {
    return wrap(() => AiController.decomposeTask(body));
  }

  static async listConversations(): Promise<AiResult<ConversationVo[]>> {
    return wrap(() => AiController.listConversations());
  }

  static async createConversation(body?: CreateConversationRequestVo): Promise<AiResult<ConversationVo>> {
    return wrap(() => AiController.createConversation(body || {}));
  }

  static async ensureBoundGoal(body: EnsureBoundGoalRequestVo): Promise<AiResult<EnsureBoundConversationResponseVo>> {
    return wrap(() => AiController.ensureBoundGoal(body));
  }

  static async ensureBoundTask(body: EnsureBoundTaskRequestVo): Promise<AiResult<EnsureBoundConversationResponseVo>> {
    return wrap(() => AiController.ensureBoundTask(body));
  }

  static async patchConversationRuntime(
    conversationId: string,
    body: PatchConversationRuntimeRequestVo
  ): Promise<AiResult<ConversationVo>> {
    return wrap(() => AiController.patchConversationRuntime(conversationId, body));
  }

  static async renameConversation(
    conversationId: string,
    body: RenameConversationRequestVo
  ): Promise<AiResult<ConversationVo>> {
    return wrap(() => AiController.renameConversation(conversationId, body));
  }

  static async pinConversation(
    conversationId: string,
    body: PinConversationRequestVo
  ): Promise<AiResult<ConversationVo>> {
    return wrap(() => AiController.pinConversation(conversationId, body));
  }

  static async deleteConversation(conversationId: string): Promise<AiResult<void>> {
    return wrap(() => AiController.deleteConversation(conversationId));
  }

  static async listMessages(conversationId: string): Promise<AiResult<MessageVo[]>> {
    return wrap(() => AiController.listMessages(conversationId));
  }

  static async startMessageStream(
    conversationId: string,
    body: StartMessageStreamRequestVo
  ): Promise<AiResult<StartMessageStreamResponseVo>> {
    return wrap(() => AiController.startMessageStream(conversationId, body));
  }

  static async cancelMessageStream(streamId: string): Promise<AiResult<CancelStreamResponseVo>> {
    return wrap(() => AiController.cancelMessageStream(streamId));
  }

  static async patchWorkspace(
    messageId: string,
    body: PatchWorkspaceRequestVo
  ): Promise<AiResult<MessageVo>> {
    return wrap(() => AiController.patchWorkspace(messageId, body));
  }

  static subscribeChatStream(handler: StreamHandler): () => void {
    ensureStreamBridge();
    streamListeners.add(handler);
    return () => {
      streamListeners.delete(handler);
    };
  }

  static unsubscribeChatStream(handler: StreamHandler): void {
    streamListeners.delete(handler);
  }
}
