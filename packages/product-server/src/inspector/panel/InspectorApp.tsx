import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  CloseOutlined,
  ConfigProvider,
  Empty,
  Flex,
  Select,
  Tabs,
  Tag,
} from '@sue/design-web-react';
import zhCN from '@sue/design-web-react/locale/zh_CN';
import { Inspect } from 'lucide-react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useWikiRuntime, WikiRuntimeProvider } from './runtime-context';
import type { WikiRuntime } from '../../runtime';
import {
  changelogJson,
  changelogMarkdown,
  coverageLabel,
  downloadText,
  eventLabel,
  specificationJson,
  specificationMarkdown,
  statusLabel,
  topicJson,
  topicMarkdown,
} from '../../export/format';
import type { ProductChangeLogEntry, ResolvedProductReference } from '../../types';
import type {
  InspectorPageContext,
  InspectorSelection,
  ProductWikiInspectorPanel,
} from '../protocol';

type PanelMode = 'wiki' | 'versions';

function inspectorApi(): ProductWikiInspectorPanel | undefined {
  return window.productWikiInspectorPanel;
}

export function InspectorApp({ runtime }: { runtime: WikiRuntime }) {
  return (
    <WikiRuntimeProvider runtime={runtime}>
      <ConfigProvider locale={zhCN}>
        <InspectorShell />
      </ConfigProvider>
    </WikiRuntimeProvider>
  );
}

function InspectorShell() {
  const api = inspectorApi();
  const { resolveProductRefsForRoute } = useWikiRuntime();
  const [selecting, setSelectingState] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('wiki');
  const [pageContext, setPageContext] = useState<InspectorPageContext | undefined>();
  const [inspectSelection, setInspectSelection] = useState<InspectorSelection | undefined>();

  const setSelecting = useCallback(
    (next: boolean) => {
      setSelectingState(next);
      api?.sendSetSelecting(next);
    },
    [api],
  );

  const setPanelTab = useCallback(
    (next: PanelMode) => {
      setPanelMode(next);
      api?.sendSetHighlightVisible(next === 'wiki');
      if (next !== 'wiki') setSelecting(false);
    },
    [api, setSelecting],
  );

  const clearInspect = useCallback(() => {
    setInspectSelection(undefined);
    setSelectingState(false);
  }, []);

  const resetUi = useCallback(() => {
    setPanelMode('wiki');
    clearInspect();
    setSelecting(false);
  }, [clearInspect, setSelecting]);

  const closePanel = useCallback(() => {
    resetUi();
    api?.sendSetVisible(false);
  }, [api, resetUi]);

  const selectingRef = useRef(selecting);
  const panelModeRef = useRef(panelMode);
  const inspectSelectionRef = useRef(inspectSelection);
  selectingRef.current = selecting;
  panelModeRef.current = panelMode;
  inspectSelectionRef.current = inspectSelection;

  const pageSelection = useMemo<InspectorSelection | undefined>(() => {
    if (!pageContext) return undefined;
    return {
      productRefs: resolveProductRefsForRoute(pageContext.route, pageContext.visibleRefs),
      route: pageContext.route,
      source: 'page',
    };
  }, [pageContext, resolveProductRefsForRoute]);

  const wikiSelection = inspectSelection ?? pageSelection;

  useEffect(() => {
    const unsubscribeSelection = api?.onSelection((payload) => {
      setSelecting(false);
      setInspectSelection({ ...payload, source: payload.source || 'inspect' });
      setPanelTab('wiki');
    });
    const unsubscribePageContext = api?.onPageContext((payload) => {
      setPageContext(payload);
      if (inspectSelectionRef.current && inspectSelectionRef.current.route !== payload.route) {
        setInspectSelection(undefined);
      }
    });
    const unsubscribeCancel = api?.onCancel(() => {
      setPanelMode('wiki');
      clearInspect();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (selectingRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setSelecting(false);
        return;
      }
      if (inspectSelectionRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setInspectSelection(undefined);
        setSelectingState(false);
        api?.sendSetSelecting(false);
        api?.sendCancel();
        return;
      }
      if (panelModeRef.current !== 'wiki') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setPanelTab('wiki');
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    api?.sendRequestPageContext();
    api?.sendSetHighlightVisible(true);
    return () => {
      setSelecting(false);
      unsubscribeSelection?.();
      unsubscribePageContext?.();
      unsubscribeCancel?.();
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [api, clearInspect, setPanelTab, setSelecting]);

  return (
    <Flex container="full" className={`productInspectorRoot${selecting ? ' is-selecting' : ''}`}>
      <InspectorSplitter api={api} />
      <Flex vertical container="fill" className="productInspectorPanel" aria-label="产品讲解面板">
        <Flex container="fixed" className="productInspectorHeader" align="center" gap={8}>
          <Button
            className="productInspectorInspect"
            title="检查页面元素"
            aria-label="检查页面元素"
            aria-pressed={selecting}
            icon={<Inspect size={14} />}
            type={selecting ? 'primary' : 'text'}
            onClick={() => setSelecting(!selecting)}
          />
          <Tabs
            className="productInspectorTabs"
            size="small"
            activeKey={panelMode}
            tabBarStyle={{ marginBottom: 0 }}
            onChange={(key) => setPanelTab(key === 'versions' ? 'versions' : 'wiki')}
            items={[
              { key: 'wiki', label: '产品讲解' },
              { key: 'versions', label: '版本功能' },
            ]}
          />
          <Button
            type="text"
            className="productInspectorHeaderClose"
            title="关闭 ProductWiki"
            aria-label="关闭 ProductWiki"
            icon={<CloseOutlined />}
            onClick={closePanel}
          />
        </Flex>
        <Flex vertical container="fill" className="productInspectorContent">
          {panelMode === 'versions' ? (
            <VersionView />
          ) : wikiSelection ? (
            <SelectionView selection={wikiSelection} />
          ) : (
            <Empty description="当前路由暂无对应说明" />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

function InspectorSplitter({ api }: { api: ProductWikiInspectorPanel | undefined }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      api?.onSplitterDragEnd(() => {
        ref.current?.classList.remove('is-dragging');
      }),
    [api],
  );

  return (
    <div
      ref={ref}
      className="productInspectorSplitter is-left"
      role="separator"
      aria-orientation="vertical"
      aria-label="调整检查器与主窗口宽度"
      onMouseDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.classList.add('is-dragging');
        api?.sendSplitterDragStart('left', event.screenX);
      }}
    />
  );
}

function SelectionView({ selection }: { selection: InspectorSelection }) {
  const { resolveProductReference } = useWikiRuntime();
  const topics = useMemo(
    () =>
      selection.productRefs
        .map((reference) => resolveProductReference(reference))
        .filter((topic): topic is ResolvedProductReference => Boolean(topic)),
    [selection.productRefs, resolveProductReference],
  );
  const [topicId, setTopicId] = useState(topics[0]?.id);
  const active = topics.find((topic) => topic.id === topicId) || topics[0];

  useEffect(() => {
    setTopicId(topics[0]?.id);
  }, [topics]);

  if (!topics.length) {
    return (
      <>
        <span className="productInspectorPath">路由 {selection.route}</span>
        <Empty
          description={
            selection.source === 'page'
              ? '当前路由暂无对应说明'
              : selection.productRefs.length
                ? '未解析到对应产品说明'
                : '该元素暂无产品说明'
          }
        />
      </>
    );
  }

  return (
    <>
      <span className="productInspectorPath">路由 {selection.route}</span>
      {topics.length > 1 ? (
        <div className="productInspectorStack">
          {topics.map((topic, index) => (
            <button
              key={topic.id}
              type="button"
              className="productInspectorStackItem"
              aria-current={topic.id === active.id ? 'true' : undefined}
              onClick={() => setTopicId(topic.id)}
            >
              {index + 1}. {topic.title}
            </button>
          ))}
        </div>
      ) : null}
      {active ? <WikiTopic topic={active} stacked={topics.length > 1} source={selection.source} /> : null}
    </>
  );
}

function VersionView() {
  const { productVersions, productVersionChanges } = useWikiRuntime();
  const [version, setVersion] = useState(productVersions[0] || '');
  const changes = useMemo(() => (version ? productVersionChanges(version) : []), [version, productVersionChanges]);
  const groups = useMemo(() => {
    const next = new Map<string, ProductChangeLogEntry[]>();
    changes.forEach((change) => {
      const items = next.get(change.feature.moduleTitle) || [];
      items.push(change);
      next.set(change.feature.moduleTitle, items);
    });
    return next;
  }, [changes]);

  if (!productVersions.length) {
    return <Empty description="暂无可查看的版本记录" />;
  }

  return (
    <>
      <label className="productInspectorVersionControl">
        <span>版本</span>
        <Select
          aria-label="选择版本"
          value={version}
          onChange={(value) => setVersion(String(value))}
          options={productVersions.map((item) => ({ value: item, label: item }))}
          style={{ width: '100%' }}
        />
      </label>
      <p className="productInspectorVersionSummary">
        {version} 共 {changes.length} 项变更
      </p>
      {changes.length ? (
        <Flex gap={8} className="productInspectorExport">
          <Button size="small" onClick={() => downloadText(`${version}.md`, changelogMarkdown(version, changes), 'text/markdown')}>
            导出 Markdown
          </Button>
          <Button size="small" onClick={() => downloadText(`${version}.json`, changelogJson(version, changes), 'application/json')}>
            导出 JSON
          </Button>
        </Flex>
      ) : null}
      {changes.length ? (
        <div className="productInspectorVersionList">
          {[...groups.entries()].map(([moduleTitle, items]) => (
            <section key={moduleTitle} className="productInspectorVersionGroup">
              <h2>{moduleTitle}</h2>
              <div className="productInspectorVersionEntries">
                {items.map((change) => (
                  <VersionChangeEntry key={`${change.feature.key}-${change.version}-${change.date}`} change={change} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty description="该版本暂无变更记录" />
      )}
    </>
  );
}

function VersionChangeEntry({ change }: { change: ProductChangeLogEntry }) {
  const name = change.feature.parentName
    ? `${change.feature.parentName}.${change.feature.name}`
    : change.feature.name;
  return (
    <article className="productInspectorVersionEntry">
      <div className="productInspectorVersionEntryHeading">
        <b>{name}</b>
        <Tag>{scopeLabel(change.feature.scope)}</Tag>
      </div>
      <span className="productInspectorVersionEntryMeta">
        {change.date} · {eventLabel(change.event)}
      </span>
      <p>{change.summary}</p>
    </article>
  );
}

function WikiTopic({
  topic,
  stacked,
  source,
}: {
  topic: ResolvedProductReference;
  stacked: boolean;
  source?: InspectorSelection['source'];
}) {
  const { productSpecs } = useWikiRuntime();
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(topic.markdown, { gfm: true }) as string),
    [topic.markdown],
  );

  return (
    <section className="productInspectorTopic">
      <Flex gap={8} className="productInspectorTags">
        <Tag>{topic.module}</Tag>
        <Tag>{topic.title}</Tag>
        <Tag>产品：{statusLabel(topic.productStatus)}</Tag>
        <Tag>表面：{coverageLabel(topic.surfaceCoverage)}</Tag>
        {stacked ? <Tag>{source === 'page' ? '本页' : '祖先链'}</Tag> : null}
      </Flex>
      <span className="productInspectorPath">{topic.path}</span>
      {topic.latestChange ? (
        <p className="productInspectorChange">
          最近变更 {topic.latestChange.version} · {topic.latestChange.date} · {topic.latestChange.summary}
        </p>
      ) : null}
      <Flex gap={8} className="productInspectorExport">
        <Button size="small" onClick={() => downloadText(`${topic.id}.md`, topicMarkdown(topic), 'text/markdown')}>
          导出本条 Markdown
        </Button>
        <Button size="small" onClick={() => downloadText(`${topic.id}.json`, topicJson(topic), 'application/json')}>
          导出本条 JSON
        </Button>
        <Button
          size="small"
          onClick={() => downloadText(`${topic.spec.id}.md`, specificationMarkdown(topic.spec, productSpecs), 'text/markdown')}
        >
          导出模块 Markdown
        </Button>
        <Button size="small" onClick={() => downloadText(`${topic.spec.id}.json`, specificationJson(topic.spec), 'application/json')}>
          导出模块 JSON
        </Button>
      </Flex>
      <article className="productInspectorMarkdown" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

function scopeLabel(scope: ProductChangeLogEntry['feature']['scope']) {
  return ({ module: '模块', entity: '实体', field: '字段', view: '视图', rule: '规则' })[scope];
}
