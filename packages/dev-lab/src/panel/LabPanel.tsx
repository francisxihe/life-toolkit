import { useEffect, useMemo, useState } from 'react';
import { Button, CloseOutlined, ConfigProvider, Empty, Flex, Tabs, Tag } from '@sue/design-web-react';
import zhCN from '@sue/design-web-react/locale/zh_CN';
import { getLabPanelBridge } from '../protocol';
import type { TraceEntry, TraceSpan } from '../types';

type LabToolId = 'request';

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
  return (
    <ConfigProvider locale={zhCN}>
      <LabShell />
    </ConfigProvider>
  );
}

function LabShell() {
  const [tool, setTool] = useState<LabToolId>('request');
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    const api = getLabPanelBridge();
    if (!api) return undefined;
    void api.snapshot().then(setEntries);
    return api.onUpdate(setEntries);
  }, []);

  const ordered = useMemo(() => [...entries].reverse(), [entries]);

  useEffect(() => {
    if (ordered.length === 0) {
      setSelectedEntryId(null);
      return;
    }
    setSelectedEntryId((current) =>
      current && ordered.some((entry) => entry.id === current) ? current : ordered[0].id,
    );
  }, [ordered]);

  const selected = ordered.find((entry) => entry.id === selectedEntryId);

  const clearEntries = () => {
    void getLabPanelBridge()?.clear().then((next) => {
      if (Array.isArray(next)) setEntries(next);
      else setEntries([]);
    });
  };

  return (
    <Flex vertical container="full" className="labPanel" aria-label="Lab">
      <Flex container="fixed" className="labHeader" align="center" gap={8}>
        <Tabs
          className="labTabs"
          size="small"
          activeKey={tool}
          tabBarStyle={{ marginBottom: 0 }}
          onChange={(key) => setTool(key as LabToolId)}
          tabBarExtraContent={
            <Button size="small" onClick={clearEntries}>
              清空
            </Button>
          }
          items={[{ key: 'request', label: '请求' }]}
        />
        <Button
          type="text"
          className="labHeaderClose"
          title="关闭 Lab"
          aria-label="关闭 Lab"
          icon={<CloseOutlined />}
          onClick={() => getLabPanelBridge()?.sendSetVisible(false)}
        />
      </Flex>
      {tool === 'request' ? (
        <RequestView
          ordered={ordered}
          selectedEntryId={selectedEntryId}
          selected={selected}
          onSelect={setSelectedEntryId}
        />
      ) : null}
    </Flex>
  );
}

function RequestView({
  ordered,
  selectedEntryId,
  selected,
  onSelect,
}: {
  ordered: TraceEntry[];
  selectedEntryId: string | null;
  selected: TraceEntry | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <Flex container="fill" className="labBody">
      <Flex vertical container="fixed" className="labList">
        {ordered.length === 0 ? (
          <Empty description="还没有捕获到请求" />
        ) : (
          ordered.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`labRow ${entry.id === selectedEntryId ? 'labRowSelected' : ''}`}
              onClick={() => onSelect(entry.id)}
            >
              <i className={`labStatus ${statusClass(entry)}`} />
              {entry.kind === 'ipc' ? <span className="labMethod">{entry.method}</span> : null}
              <span className="labPath">{rowTitle(entry)}</span>
              <span className="labMeta">{formatDuration(entry.durationMs)}</span>
            </button>
          ))
        )}
      </Flex>
      <Flex vertical container="fill" className="labDetailPane">
        {selected ? <EntryDetail entry={selected} /> : <Empty description="选择一条请求查看详情" />}
      </Flex>
    </Flex>
  );
}

function EntryDetail({ entry }: { entry: TraceEntry }) {
  return (
    <div className="labDetail">
      <div className="labDetailHead">
        {entry.kind === 'ipc' ? <Tag>{entry.method}</Tag> : <Tag>{entry.kind}</Tag>}
        <span className="labPath">{rowTitle(entry)}</span>
        <span className="labMeta">
          {formatDuration(entry.durationMs)} · {formatTime(entry.startedAt)}
        </span>
      </div>
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
