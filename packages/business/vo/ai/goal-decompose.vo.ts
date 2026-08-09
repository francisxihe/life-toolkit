import { AiSuggestionKind } from '@true-north/enum';

export type GoalDecomposeRequestVo = {
  goalId: string;
  /** true 时跳过缓存，强制调用模型并覆盖缓存 */
  forceRefresh?: boolean;
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
