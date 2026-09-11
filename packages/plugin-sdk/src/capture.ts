import { z } from 'zod';

export const captureSuggestionStatusSchema = z.enum(['draft', 'selected', 'accepted', 'rejected']);

export type CaptureSuggestionStatus = z.infer<typeof captureSuggestionStatusSchema>;

/** Capture suggestion on the public protocol. `type` is a namespaced id, e.g. `growth.todo`. */
export const captureSuggestionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  payload: z.record(z.unknown()),
  status: captureSuggestionStatusSchema.default('draft'),
  conflict: z.string().optional(),
});

export type CaptureSuggestion = z.infer<typeof captureSuggestionSchema>;

export const capturePayloadSchema = z.object({
  runId: z.string().optional(),
  analysisSummary: z.string(),
  sourceText: z.string().optional(),
  suggestions: z.array(captureSuggestionSchema),
});

export type CapturePayload = z.infer<typeof capturePayloadSchema>;

export const adoptCaptureRequestSchema = z.object({
  messageId: z.string().min(1),
  suggestions: z.array(captureSuggestionSchema),
  sourceText: z.string().optional(),
  analysisSummary: z.string().optional(),
  runId: z.string().optional(),
});

export type AdoptCaptureRequest = z.infer<typeof adoptCaptureRequestSchema>;

const LEGACY_KIND_TO_TYPE: Record<string, string> = {
  todo: 'growth.todo',
  expense: 'expense.transaction',
  purchase: 'purchase.item',
  bookmark: 'library.bookmark',
};

export function captureTypeFromLegacyKind(kind: string): string {
  return LEGACY_KIND_TO_TYPE[kind] || kind;
}

export function legacyKindFromCaptureType(type: string): string {
  const entry = Object.entries(LEGACY_KIND_TO_TYPE).find(([, value]) => value === type);
  return entry?.[0] || type.split('.').pop() || type;
}

/** Normalize persisted workspace payloads that still use `kind`. */
export function normalizeCaptureSuggestion(raw: Record<string, unknown>): CaptureSuggestion {
  const type =
    typeof raw.type === 'string' && raw.type
      ? raw.type
      : captureTypeFromLegacyKind(String(raw.kind || ''));
  const status: CaptureSuggestionStatus = raw.accepted
    ? 'accepted'
    : raw.selected === false
      ? 'draft'
      : raw.status === 'accepted' || raw.status === 'selected' || raw.status === 'rejected' || raw.status === 'draft'
        ? raw.status
        : 'selected';
  const payload =
    raw.payload && typeof raw.payload === 'object' && !Array.isArray(raw.payload)
      ? (raw.payload as Record<string, unknown>)
      : {
          title: raw.title,
          planned: raw.planned,
          amount: raw.amount,
          transactionType: raw.transactionType,
          category: raw.category,
          tags: raw.tags,
          note: raw.note,
          occurredAt: raw.occurredAt,
          quantity: raw.quantity,
          unit: raw.unit,
          neededAt: raw.neededAt,
          url: raw.url,
        };
  return captureSuggestionSchema.parse({
    id: String(raw.id || ''),
    type,
    payload,
    status,
    conflict: typeof raw.conflict === 'string' ? raw.conflict : undefined,
  });
}

export type CaptureAdoptedLink = {
  pluginId: string;
  entityType: string;
  entityId: string;
  role?: string;
  label?: string;
};

export type CaptureAdopter = {
  type: string;
  adopt(suggestion: CaptureSuggestion): Promise<CaptureAdoptedLink>;
};
