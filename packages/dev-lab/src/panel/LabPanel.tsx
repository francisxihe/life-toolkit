import { useEffect, useMemo, useState } from 'react';
import '../protocol';
import type { TraceEntry, TraceSpan } from '../types';

type LabToolId = 'request';

const TOOLS: Array<{ id: LabToolId; label: string; title: string }> = [
  { id: 'request', label: '请求', title: 'IPC 请求时间线' },
];

function formatDuration(ms?: number): string {
  if (ms == null) return '…';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  const pad = (value: number, size = 2) => String(value).padStart(size, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function pretty(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function rowTitle(entry: TraceEntry): string {
  if (entry.kind === 'ipc') return entry.path || 'IPC';
  return entry.summary || entry.kind;
}

function statusClass(entry: TraceEntry): string {
  if (entry.open) return 'is-pending';
  if (entry.ok === false || entry.error) return 'is-error';
  if (entry.ok) return 'is-ok';
  return '';
}

export function LabApp() {
  const [tool, setTool] = useState<LabToolId>('request');
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const api = window.labPanel;
    if (!api) return undefined;
    void api.snapshot().then(setEntries);
    return api.onUpdate(setEntries);
  }, []);

  const ordered = useMemo(() => [...entries].reverse(), [entries]);

  return (
    <>
      <nav className="labToolRail" aria-label="Lab 工具">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="labToolTrigger"
            title={item.title}
            aria-pressed={tool === item.id}
            onClick={() => setTool(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <section className="labPanel" aria-label="Lab">
        {tool === 'request' ? (
          <>
            <header className="labHeader">
              <div>
                <strong>请求</strong>
                <span>每条 IPC 一行，展开查看参数、响应与子 span</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  void window.labPanel?.clear().then((next) => {
                    if (Array.isArray(next)) setEntries(next);
                    else setEntries([]);
                  });
                  setExpanded({});
                }}
              >
                清空
              </button>
            </header>
            <div className="labContent">
              {ordered.length === 0 ? (
                <p className="labEmpty">还没有捕获到请求</p>
              ) : (
                ordered.map((entry) => (
                  <article key={entry.id} className="labRow">
                    <button
                      type="button"
                      className="labRowHeader"
                      aria-expanded={Boolean(expanded[entry.id])}
                      onClick={() =>
                        setExpanded((current) => ({ ...current, [entry.id]: !current[entry.id] }))
                      }
                    >
                      <i className={`labStatus ${statusClass(entry)}`} />
                      {entry.kind === 'ipc' ? <span className="labMethod">{entry.method}</span> : null}
                      <span className="labPath">{rowTitle(entry)}</span>
                      <span className="labMeta">
                        {formatDuration(entry.durationMs)} · {formatTime(entry.startedAt)}
                      </span>
                    </button>
                    {expanded[entry.id] ? <EntryDetail entry={entry} /> : null}
                  </article>
                ))
              )}
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}

function EntryDetail({ entry }: { entry: TraceEntry }) {
  return (
    <div className="labDetail">
      {entry.streamId ? (
        <dl className="labBlock">
          <dt>streamId</dt>
          <dd className="labPre">{entry.streamId}</dd>
        </dl>
      ) : null}
      {entry.kind === 'ipc' ? (
        <>
          <dl className="labBlock">
            <dt>params</dt>
            <dd>
              <pre className="labPre">{pretty(entry.params)}</pre>
            </dd>
          </dl>
          <dl className="labBlock">
            <dt>response</dt>
            <dd>
              <pre className="labPre">{pretty(entry.response)}</pre>
            </dd>
          </dl>
        </>
      ) : null}
      {entry.error ? <p className="labError">{entry.error}</p> : null}
      {entry.spans.map((span) => (
        <SpanCard key={span.id} span={span} />
      ))}
    </div>
  );
}

function SpanCard({ span }: { span: TraceSpan }) {
  return (
    <div className="labSpan">
      <div className="labSpanHead">
        <span className="labKind">{span.kind}</span>
        <span className="labPath">{span.summary}</span>
        <span className="labMeta">{formatDuration(span.durationMs)}</span>
      </div>
      {span.error ? <p className="labError">{span.error}</p> : null}
      {span.detail != null ? <pre className="labPre">{pretty(span.detail)}</pre> : null}
    </div>
  );
}
