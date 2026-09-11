import type { AiDomainContribution } from '@true-north/plugin-sdk';
import { goalDecomposeCapability } from './goal-decompose.capability';
import { taskDecomposeCapability } from './task-decompose.capability';
import { growthAgentTools } from './tools';

export const growthAiContribution: AiDomainContribution = {
  capabilities: [goalDecomposeCapability, taskDecomposeCapability],
  tools: growthAgentTools,
  agentInstructions: `通过 MCP 工具读写目标与任务：search_goals、search_tasks、get_goal、get_task、decompose_goal、decompose_task。
- 拆解必须先 get_goal / get_task 读取上下文，再调用 decompose_* 并传入你生成的 suggestions（及可选 analysisSummary）；不要只输出文本列表。`,
};
