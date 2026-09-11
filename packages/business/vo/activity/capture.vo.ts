import type { AiWorkspacePayloadVo } from '../ai/conversation.vo';

export type CaptureSuggestionKind = 'todo' | 'expense' | 'purchase' | 'bookmark';
export type CaptureSuggestionStatus = 'draft' | 'selected' | 'accepted' | 'rejected';

export type CaptureSuggestionVo = {
  id: string;
  type?: string;
  kind?: CaptureSuggestionKind;
  payload?: Record<string, unknown>;
  status?: CaptureSuggestionStatus;
  title: string;
  selected?: boolean;
  accepted?: boolean;
  conflict?: string;
  planned?: string;
  amount?: number;
  transactionType?: 'income' | 'expense';
  category?: string;
  tags?: string[];
  note?: string;
  occurredAt?: string;
  quantity?: number;
  unit?: string;
  neededAt?: string;
  url?: string;
};

export type CapturePayloadVo = {
  runId?: string;
  analysisSummary: string;
  suggestions: CaptureSuggestionVo[];
  sourceText?: string;
};

export type AdoptCaptureRequestVo = {
  messageId: string;
  suggestions: CaptureSuggestionVo[];
  sourceText?: string;
  analysisSummary?: string;
  runId?: string;
};

/** @deprecated 使用 CaptureSuggestionKind */
export type AiCaptureSuggestionKind = CaptureSuggestionKind;
/** @deprecated 使用 CaptureSuggestionVo */
export type AiCaptureSuggestionVo = CaptureSuggestionVo;
/** @deprecated 使用 CapturePayloadVo */
export type AiCapturePayloadVo = CapturePayloadVo;

export function parseCapturePayload(payload: AiWorkspacePayloadVo): CapturePayloadVo {
  if (!payload || typeof payload !== 'object') {
    throw new Error('工作台载荷无效');
  }
  if (typeof payload.analysisSummary !== 'string' || !Array.isArray(payload.suggestions)) {
    throw new Error('工作台载荷无效');
  }
  return payload as unknown as CapturePayloadVo;
}
