import type { AiContribution as AiDomainContribution } from '@true-north/plugin-sdk';
import { activityCaptureCapability } from './activity-capture.capability';
import { activityAgentTools } from './tools';

export const activityAiContribution: AiDomainContribution = {
  capabilities: [activityCaptureCapability],
  tools: activityAgentTools,
  agentInstructions: `当用户要记下生活里的事实时，调用 capture_activity。
- 「午饭 38 元」「明天提交报告」「周六买滤芯」「收藏该网址」属于记录意图，必须调用 capture_activity，不要只回复文本。
- 知识问答、讨论、比较或解释（例如「午饭通常多少钱」）不要调用 capture_activity。
- 意图不明确时先追问，不要擅自记录。`,
};
