import { Body, Controller, Get, Param, Post, Put } from '@business/decorators';
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
import { AiPlatformError, toIpcError } from './ai-error';
import { capabilityRegistry } from './capability/capability.registry';
import { conversationService } from './conversation/conversation.service';
import { runtimeService } from './runtime';

@Controller('/ai')
export class AiController {
  constructor(
    private readonly conversations = conversationService,
    private readonly runtime = runtimeService
  ) {}

  @Get('/runtime/agents', { description: '本机编码 Agent 探测列表' })
  async listRuntimeAgents(): Promise<RuntimeAgentVo[]> {
    try {
      return this.runtime.listAgents();
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Get('/runtime/selection', { description: '读取应用级编码 Agent 偏好' })
  async getRuntimeSelection(): Promise<RuntimeSelectionVo> {
    try {
      return this.runtime.getSelection();
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Put('/runtime/selection', { description: '写入应用级编码 Agent 偏好' })
  async putRuntimeSelection(@Body() body: PutRuntimeSelectionRequestVo): Promise<RuntimeSelectionVo> {
    try {
      if (!body?.runtimeId?.trim()) throw AiPlatformError.internal('缺少 runtimeId');
      return this.runtime.putSelection(body.runtimeId.trim());
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Post('/capabilities/goal/decompose', { description: '目标拆解' })
  async decomposeGoal(@Body() body: GoalDecomposeRequestVo): Promise<GoalDecomposeResponseVo> {
    try {
      if (!body?.goalId?.trim()) throw AiPlatformError.internal('缺少 goalId');
      return await capabilityRegistry.getGoalDecompose().execute(body);
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Post('/capabilities/task/decompose', { description: '任务拆解' })
  async decomposeTask(@Body() body: TaskDecomposeRequestVo): Promise<TaskDecomposeResponseVo> {
    try {
      if (!body?.taskId?.trim()) throw AiPlatformError.internal('缺少 taskId');
      return await capabilityRegistry.getTaskDecompose().execute(body);
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Get('/conversations', { description: '会话列表' })
  async listConversations(): Promise<ConversationVo[]> {
    try {
      return await this.conversations.list();
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Post('/conversations', { description: '创建空白会话' })
  async createConversation(@Body() body: CreateConversationRequestVo): Promise<ConversationVo> {
    try {
      return await this.conversations.createBlank(body?.title);
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Post('/conversations/bound/goal', { description: '确保目标绑定会话' })
  async ensureBoundGoal(@Body() body: EnsureBoundGoalRequestVo): Promise<EnsureBoundConversationResponseVo> {
    try {
      return await this.conversations.ensureBoundGoal(body?.goalId);
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Post('/conversations/bound/task', { description: '确保任务绑定会话' })
  async ensureBoundTask(@Body() body: EnsureBoundTaskRequestVo): Promise<EnsureBoundConversationResponseVo> {
    try {
      return await this.conversations.ensureBoundTask(body?.taskId);
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Put('/conversations/:id/runtime', { description: '切换会话所用编码 Agent 并清空原生线程' })
  async patchConversationRuntime(
    @Param('id') id: string,
    @Body() body: PatchConversationRuntimeRequestVo
  ): Promise<ConversationVo> {
    try {
      if (!id?.trim()) throw AiPlatformError.internal('缺少 conversationId');
      return await this.conversations.patchRuntime(id.trim(), body || { runtimeId: '' });
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Get('/conversations/:id/messages', { description: '会话消息列表' })
  async listMessages(@Param('id') id: string): Promise<MessageVo[]> {
    try {
      if (!id?.trim()) throw AiPlatformError.internal('缺少 conversationId');
      return await this.conversations.getMessages(id.trim());
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Post('/conversations/:id/messages/stream', { description: '启动会话流式发消息' })
  async startMessageStream(
    @Param('id') id: string,
    @Body() body: StartMessageStreamRequestVo
  ): Promise<StartMessageStreamResponseVo> {
    try {
      if (!id?.trim()) throw AiPlatformError.internal('缺少 conversationId');
      return await this.conversations.startMessageStream(
        id.trim(),
        body?.text || '',
        body?.entityLinks
      );
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Post('/conversations/streams/:streamId/cancel', { description: '取消会话流式生成' })
  async cancelMessageStream(@Param('streamId') streamId: string): Promise<CancelStreamResponseVo> {
    try {
      if (!streamId?.trim()) throw AiPlatformError.internal('缺少 streamId');
      return this.conversations.cancelStream(streamId.trim());
    } catch (error) {
      throw toIpcError(error);
    }
  }

  @Put('/messages/:id/workspace', { description: '写回工作台预览草稿' })
  async patchWorkspace(
    @Param('id') id: string,
    @Body() body: PatchWorkspaceRequestVo
  ): Promise<MessageVo> {
    try {
      if (!id?.trim()) throw AiPlatformError.internal('缺少 messageId');
      return await this.conversations.patchWorkspacePayload(id.trim(), body || { suggestions: [] });
    } catch (error) {
      throw toIpcError(error);
    }
  }
}
