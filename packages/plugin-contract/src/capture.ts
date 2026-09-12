import { z } from 'zod';

export const captureSuggestionStatusSchema = z.enum(['draft', 'selected', 'accepted', 'rejected']);

export type CaptureSuggestionStatus = z.infer<typeof captureSuggestionStatusSchema>;

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

export function normalizeCaptureSuggestion(raw: Record<string, unknown>): CaptureSuggestion {
  const type = typeof raw.type === 'string' && raw.type ? raw.type : String(raw.kind || '');
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
