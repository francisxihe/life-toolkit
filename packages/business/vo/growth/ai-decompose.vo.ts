import { AiSuggestionKind } from '@true-north/enum';
import type { AiEntityLinkVo, AiWorkspacePayloadVo } from '../ai/conversation.vo';

export type AiSuggestionDraftVo = {
  kind: AiSuggestionKind | `${AiSuggestionKind}`;
  title: string;
  reason?: string;
  impact?: string;
  planned?: string;
  importance?: number;
  difficulty?: number;
};

export type GoalDecomposeRequestVo = {
  goalId: string;
  analysisSummary?: string;
  /** 由当前会话 Agent 生成；缺省时仅可命中缓存，不再请求 HTTP 模型 */
  suggestions?: AiSuggestionDraftVo[];
};

export type TaskDecomposeRequestVo = {
  taskId: string;
  analysisSummary?: string;
  suggestions?: AiSuggestionDraftVo[];
};

export type AiSuggestionVo = {
  id: string;
  kind: AiSuggestionKind | `${AiSuggestionKind}`;
  title: string;
  reason: string;
  impact: string;
  planned: string;
  importance: number;
  difficulty: number;
  conflict?: string;
};

export type GoalDecomposeResponseVo = {
  runId: string;
  analysisSummary: string;
  suggestions: AiSuggestionVo[];
};

/** 与 goal 同构；建议 kind 仅 task/todo */
export type TaskDecomposeResponseVo = GoalDecomposeResponseVo;

export type AiWorkspaceSuggestionVo = AiSuggestionVo & {
  accepted?: boolean;
};

export type AiDecomposePayloadVo = {
  runId?: string;
  analysisSummary: string;
  suggestions: AiWorkspaceSuggestionVo[];
  ref?: AiEntityLinkVo;
};

export function parseDecomposePayload(payload: AiWorkspacePayloadVo): AiDecomposePayloadVo {
  if (!payload || typeof payload !== 'object') {
    throw new Error('工作台载荷无效');
  }
  if (typeof payload.analysisSummary !== 'string' || !Array.isArray(payload.suggestions)) {
    throw new Error('工作台载荷无效');
  }
  return payload as unknown as AiDecomposePayloadVo;
}
