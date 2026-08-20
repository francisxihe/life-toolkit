export type TraceSpanKind = 'sql' | 'spawn' | 'mcp';

export type TraceEntryKind = 'ipc' | TraceSpanKind;

export type TraceSpan = {
  id: string;
  kind: TraceSpanKind;
  startedAt: number;
  durationMs?: number;
  summary: string;
  detail?: unknown;
  error?: string;
};

export type TraceEntry = {
  id: string;
  kind: TraceEntryKind;
  startedAt: number;
  durationMs?: number;
  open?: boolean;
  ok?: boolean;
  error?: string;
  method?: string;
  path?: string;
  params?: unknown;
  response?: unknown;
  streamId?: string;
  summary?: string;
  spans: TraceSpan[];
};
