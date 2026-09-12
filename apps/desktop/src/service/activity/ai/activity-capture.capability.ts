import { randomUUID } from 'crypto';
import { z } from 'zod';
import { ActivityCaptureKey } from '@true-north/enum';
import type { CapturePayloadVo, CaptureSuggestionVo } from '@true-north/vo';

const TOTAL_CAP = 8;

const HOST_CAPTURE_TYPE_FROM_KIND: Record<string, string> = {
  todo: 'growth.todo',
  expense: 'expense.transaction',
  purchase: 'purchase.item',
  bookmark: 'library.bookmark',
};

function captureTypeFromLegacyKind(kind: string) {
  return HOST_CAPTURE_TYPE_FROM_KIND[kind] || kind;
}

const draftSchema = z.object({
  kind: z.enum(['todo', 'expense', 'purchase', 'bookmark']),
  title: z.string().min(1),
  planned: z.string().optional(),
  amount: z.coerce.number().optional(),
  transactionType: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  occurredAt: z.string().optional(),
  quantity: z.coerce.number().optional(),
  unit: z.string().optional(),
  neededAt: z.string().optional(),
  url: z.string().optional(),
});

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim()) || /^[\w-]+\.[\w.-]+(\/|$)/.test(value.trim());
}

function normalizeUrl(value?: string, title?: string): string | undefined {
  const raw = (value || title || '').trim();
  if (!looksLikeUrl(raw)) return value;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function validateSuggestion(draft: z.infer<typeof draftSchema>): CaptureSuggestionVo {
  const title = draft.title.trim();
  const suggestion: CaptureSuggestionVo = {
    id: randomUUID(),
    kind: draft.kind,
    type: captureTypeFromLegacyKind(draft.kind),
    status: 'selected',
    title,
    selected: true,
    planned: draft.planned,
    amount: draft.amount,
    transactionType: draft.transactionType,
    category: draft.category,
    tags: draft.tags,
    note: draft.note,
    occurredAt: draft.occurredAt,
    quantity: draft.quantity,
    unit: draft.unit,
    neededAt: draft.neededAt,
    url: draft.url,
  };

  if (draft.kind === 'expense') {
    if (!(draft.amount && draft.amount > 0)) {
      suggestion.conflict = '支出需要大于 0 的金额';
    }
    suggestion.transactionType = draft.transactionType || 'expense';
    suggestion.category = draft.category || 'dining';
  }
  if (draft.kind === 'bookmark') {
    const url = normalizeUrl(draft.url, title);
    suggestion.url = url;
    if (!url) suggestion.conflict = '收藏需要有效网址';
  }
  if (draft.kind === 'todo' && !suggestion.planned) {
    suggestion.planned = new Date().toISOString().slice(0, 10);
  }
  return suggestion;
}

export const activityCaptureCapability = {
  key: ActivityCaptureKey,
  execute(input: {
    analysisSummary?: string;
    sourceText?: string;
    suggestions: Array<z.infer<typeof draftSchema>>;
  }): Promise<CapturePayloadVo> {
    const drafts = (input.suggestions || []).slice(0, TOTAL_CAP).map((item) => draftSchema.parse(item));
    const suggestions = drafts.map(validateSuggestion);
    return Promise.resolve({
      runId: randomUUID(),
      analysisSummary: input.analysisSummary?.trim() || '已理解这些事项，请在工作台确认。',
      suggestions,
      sourceText: input.sourceText,
    });
  },
};
