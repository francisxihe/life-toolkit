import { Body, Controller, Post } from '@business/decorators';
import type { GoalDecomposeRequestVo, GoalDecomposeResponseVo } from '@true-north/vo';
import { AiPlatformError, toIpcError } from './ai-error';
import { capabilityRegistry } from './capability/capability.registry';

@Controller('/ai')
export class AiController {
  constructor(
    private readonly decompose = capabilityRegistry.getGoalDecompose()
  ) {}

  @Post('/capabilities/goal/decompose', { description: '目标 AI 拆解' })
  async decomposeGoal(@Body() body: GoalDecomposeRequestVo): Promise<GoalDecomposeResponseVo> {
    try {
      if (!body?.goalId?.trim()) {
        throw AiPlatformError.contextNotFound('缺少 goalId');
      }
      return await this.decompose.execute({ goalId: body.goalId.trim() });
    } catch (error) {
      throw toIpcError(error);
    }
  }
}
