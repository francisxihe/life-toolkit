import { request } from '../request';
import type {
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
  PutRuntimeSelectionRequestVo,
  RuntimeAgentVo,
  RuntimeSelectionVo,
  StartMessageStreamRequestVo,
  StartMessageStreamResponseVo,
  TaskDecomposeRequestVo,
  TaskDecomposeResponseVo,
} from '@true-north/vo';

export default class AiController {
  static async listConversations() {
    return request<ConversationVo[]>({ method: 'get' })(`/ai/conversations`);
  }

  static async createConversation(body: CreateConversationRequestVo) {
    return request<ConversationVo>({ method: 'post' })(`/ai/conversations`, body);
  }

  static async listMessages(id: string) {
    return request<MessageVo[]>({ method: 'get' })(`/ai/conversations/${id}/messages`);
  }

  static async startMessageStream(id: string, body: StartMessageStreamRequestVo) {
    return request<StartMessageStreamResponseVo>({ method: 'post' })(`/ai/conversations/${id}/messages/stream`, body);
  }

  static async cancelMessageStream(streamId: string) {
    return request<CancelStreamResponseVo>({ method: 'post' })(`/ai/conversations/streams/${streamId}/cancel`);
  }

  static async patchWorkspace(id: string, body: PatchWorkspaceRequestVo) {
    return request<MessageVo>({ method: 'put' })(`/ai/messages/${id}/workspace`, body);
  }

  static async listRuntimeAgents() {
    return request<RuntimeAgentVo[]>({ method: 'get' })(`/ai/runtime/agents`);
  }

  static async getRuntimeSelection() {
    return request<RuntimeSelectionVo>({ method: 'get' })(`/ai/runtime/selection`);
  }

  static async putRuntimeSelection(body: PutRuntimeSelectionRequestVo) {
    return request<RuntimeSelectionVo>({ method: 'put' })(`/ai/runtime/selection`, body);
  }

  static async decomposeGoal(body: GoalDecomposeRequestVo) {
    return request<GoalDecomposeResponseVo>({ method: 'post' })(`/ai/capabilities/goal/decompose`, body);
  }

  static async decomposeTask(body: TaskDecomposeRequestVo) {
    return request<TaskDecomposeResponseVo>({ method: 'post' })(`/ai/capabilities/task/decompose`, body);
  }

  static async ensureBoundGoal(body: EnsureBoundGoalRequestVo) {
    return request<EnsureBoundConversationResponseVo>({ method: 'post' })(`/ai/conversations/bound/goal`, body);
  }

  static async ensureBoundTask(body: EnsureBoundTaskRequestVo) {
    return request<EnsureBoundConversationResponseVo>({ method: 'post' })(`/ai/conversations/bound/task`, body);
  }

  static async patchConversationRuntime(id: string, body: PatchConversationRuntimeRequestVo) {
    return request<ConversationVo>({ method: 'put' })(`/ai/conversations/${id}/runtime`, body);
  }
}
