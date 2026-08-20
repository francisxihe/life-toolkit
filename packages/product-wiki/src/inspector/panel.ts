import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { History, Inspect, PanelRightClose, X, createElement, type IconNode } from 'lucide';
import {
  productVersionChanges,
  productVersions,
  resolveProductReference,
} from '../registry';
import type { ProductChangeLogEntry, ResolvedProductReference } from '../types';
import type { InspectorSelection, InspectorWidthEdge, ProductWikiInspectorPanel } from './protocol';
import './style.css';

type InspectorHandle = { destroy: () => void };

const ROOT_ID = 'product-wiki-inspector';

function inspectorApi(): ProductWikiInspectorPanel | undefined {
  return window.productWikiInspectorPanel;
}

export function bootstrapProductInspectorPanel(): InspectorHandle {
  const root = document.getElementById(ROOT_ID);
  if (!root) throw new Error(`#${ROOT_ID} is required`);
  root.querySelectorAll('[data-product-inspector-ui]').forEach((element) => element.remove());

  const toolRail = document.createElement('div');
  toolRail.className = 'productInspectorToolRail';
  toolRail.dataset.productInspectorUi = 'true';
  const selectorTrigger = iconButton('检查页面元素', Inspect);
  selectorTrigger.className = 'productInspectorTrigger';
  const versionTrigger = iconButton('查看版本功能', History);
  versionTrigger.className = 'productInspectorTrigger';
  const panel = document.createElement('main');
  panel.className = 'productInspectorPanel';
  panel.dataset.productInspectorUi = 'true';
  panel.setAttribute('aria-label', '产品讲解面板');
  const leftSplitter = createSplitter('left', '调整检查器与主窗口宽度');
  const hideTrigger = iconButton('隐藏 ProductWiki', PanelRightClose);
  hideTrigger.className = 'productInspectorTrigger';
  toolRail.append(selectorTrigger, versionTrigger, hideTrigger);
  root.append(leftSplitter, toolRail, panel);
  renderIdle(panel);

  let selecting = false;
  let panelMode: 'selection' | 'versions' | undefined;

  const api = inspectorApi();
  const setSelecting = (next: boolean) => {
    selecting = next;
    if (next) selectorTrigger.setAttribute('aria-pressed', 'true');
    else selectorTrigger.removeAttribute('aria-pressed');
    root.classList.toggle('is-selecting', next);
    api?.sendSetSelecting(next);
  };
  const resetUi = () => {
    panelMode = undefined;
    setSelecting(false);
    versionTrigger.removeAttribute('aria-pressed');
    selectorTrigger.hidden = false;
    renderIdle(panel);
  };
  const close = () => {
    resetUi();
    api?.sendCancel();
  };
  const select = (selection: InspectorSelection) => {
    panelMode = 'selection';
    setSelecting(false);
    selectorTrigger.hidden = true;
    versionTrigger.removeAttribute('aria-pressed');
    renderSelection(panel, selection, close);
  };
  const openVersionPanel = () => {
    panelMode = 'versions';
    setSelecting(false);
    selectorTrigger.hidden = false;
    versionTrigger.setAttribute('aria-pressed', 'true');
    renderVersionPanel(panel, close);
  };

  selectorTrigger.addEventListener('click', () => {
    if (panelMode === 'versions') {
      panelMode = undefined;
      versionTrigger.removeAttribute('aria-pressed');
      renderIdle(panel);
    }
    setSelecting(!selecting);
  });
  versionTrigger.addEventListener('click', () => {
    if (panelMode === 'versions') close();
    else openVersionPanel();
  });
  hideTrigger.addEventListener('click', () => {
    resetUi();
    api?.sendSetVisible(false);
  });

  const unsubscribeSelection = api?.onSelection(select);
  const unsubscribeCancel = api?.onCancel(resetUi);
  const unbindLeftSplitter = bindSplitter(leftSplitter, 'left', api);
  const unsubscribeDragEnd = api?.onSplitterDragEnd(() => {
    leftSplitter.classList.remove('is-dragging');
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || (panelMode === undefined && !selecting)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close();
  };
  document.addEventListener('keydown', onKeyDown, true);

  return {
    destroy: () => {
      setSelecting(false);
      unsubscribeSelection?.();
      unsubscribeCancel?.();
      unsubscribeDragEnd?.();
      document.removeEventListener('keydown', onKeyDown, true);
      unbindLeftSplitter();
      leftSplitter.remove();
      panel.remove();
      toolRail.remove();
      hideTrigger.remove();
    },
  };
}

function createSplitter(edge: InspectorWidthEdge, label: string) {
  const splitter = document.createElement('div');
  splitter.className = `productInspectorSplitter is-${edge}`;
  splitter.dataset.productInspectorUi = 'true';
  splitter.setAttribute('role', 'separator');
  splitter.setAttribute('aria-orientation', 'vertical');
  splitter.setAttribute('aria-label', label);
  return splitter;
}

function bindSplitter(
  splitter: HTMLElement,
  edge: InspectorWidthEdge,
  api: ProductWikiInspectorPanel | undefined,
) {
  const onDown = (event: MouseEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    splitter.classList.add('is-dragging');
    api?.sendSplitterDragStart(edge, event.screenX);
  };
  splitter.addEventListener('mousedown', onDown);
  return () => {
    splitter.removeEventListener('mousedown', onDown);
  };
}

function renderIdle(panel: HTMLElement) {
  const header = document.createElement('header');
  header.className = 'productInspectorHeader';
  const title = document.createElement('div');
  title.innerHTML = '<span>ProductWiki</span><b>产品讲解</b>';
  header.append(title);
  const content = document.createElement('div');
  content.className = 'productInspectorContent';
  content.append(emptyTopic('在主窗口点选带产品表面的区域，查看 ProductWiki 说明。'));
  panel.replaceChildren(header, content);
}

function renderSelection(panel: HTMLElement, selection: InspectorSelection, close: () => void) {
  const header = document.createElement('header');
  header.className = 'productInspectorHeader';
  const title = document.createElement('div');
  title.innerHTML = '<span>ProductWiki</span><b>产品讲解</b>';
  const closeButton = iconButton('关闭产品讲解', X);
  closeButton.addEventListener('click', close);
  header.append(title, closeButton);

  const content = document.createElement('div');
  content.className = 'productInspectorContent';
  const route = document.createElement('span');
  route.className = 'productInspectorPath';
  route.textContent = `路由 ${selection.route}`;
  content.append(route);

  const topics = selection.productRefs
    .map((reference) => resolveProductReference(reference))
    .filter((topic): topic is ResolvedProductReference => Boolean(topic));

  if (!topics.length) {
    content.append(emptyTopic(selection.productRefs.length ? '未解析到对应产品说明' : '该元素暂无产品说明'));
    panel.replaceChildren(header, content);
    return;
  }

  const topicSlot = document.createElement('div');
  topicSlot.append(wikiTopic(topics[0], topics.length > 1));
  if (topics.length > 1) {
    content.append(stackNav(topics, (topic) => {
      topicSlot.replaceChildren(wikiTopic(topic, true));
    }));
  }
  content.append(topicSlot);
  panel.replaceChildren(header, content);
}

function stackNav(topics: readonly ResolvedProductReference[], onSelect: (topic: ResolvedProductReference) => void) {
  const nav = document.createElement('div');
  nav.className = 'productInspectorStack';
  topics.forEach((topic, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'productInspectorStackItem';
    if (index === 0) button.setAttribute('aria-current', 'true');
    button.textContent = `${index + 1}. ${topic.title}`;
    button.addEventListener('click', () => {
      nav.querySelectorAll('[aria-current]').forEach((item) => item.removeAttribute('aria-current'));
      button.setAttribute('aria-current', 'true');
      onSelect(topic);
    });
    nav.append(button);
  });
  return nav;
}

function renderVersionPanel(panel: HTMLElement, close: () => void) {
  const header = document.createElement('header');
  header.className = 'productInspectorHeader';
  const title = document.createElement('div');
  title.innerHTML = '<span>ProductWiki</span><b>版本功能</b>';
  const closeButton = iconButton('关闭版本功能', X);
  closeButton.addEventListener('click', close);
  header.append(title, closeButton);

  const content = document.createElement('div');
  content.className = 'productInspectorContent';
  const versions = productVersions;
  if (!versions.length) {
    content.append(emptyTopic('暂无可查看的版本记录'));
    panel.replaceChildren(header, content);
    return;
  }

  const controls = document.createElement('label');
  controls.className = 'productInspectorVersionControl';
  const label = document.createElement('span');
  label.textContent = '版本';
  const select = document.createElement('select');
  select.setAttribute('aria-label', '选择版本');
  versions.forEach((version) => {
    const option = document.createElement('option');
    option.value = version;
    option.textContent = version;
    select.append(option);
  });
  controls.append(label, select);

  const summary = document.createElement('p');
  summary.className = 'productInspectorVersionSummary';
  const list = document.createElement('div');
  list.className = 'productInspectorVersionList';
  const renderChanges = () => {
    const changes = productVersionChanges(select.value);
    summary.textContent = `${select.value} 共 ${changes.length} 项变更`;
    list.replaceChildren(changes.length ? versionChangeGroups(changes) : emptyTopic('该版本暂无变更记录'));
  };
  select.addEventListener('change', renderChanges);
  renderChanges();
  content.append(controls, summary, list);
  panel.replaceChildren(header, content);
}

function versionChangeGroups(changes: readonly ProductChangeLogEntry[]) {
  const groups = new Map<string, ProductChangeLogEntry[]>();
  changes.forEach((change) => {
    const items = groups.get(change.feature.moduleTitle) || [];
    items.push(change);
    groups.set(change.feature.moduleTitle, items);
  });
  const fragment = document.createDocumentFragment();
  groups.forEach((items, moduleTitle) => {
    const section = document.createElement('section');
    section.className = 'productInspectorVersionGroup';
    const heading = document.createElement('h2');
    heading.textContent = moduleTitle;
    const entries = document.createElement('div');
    entries.className = 'productInspectorVersionEntries';
    items.forEach((change) => entries.append(versionChangeEntry(change)));
    section.append(heading, entries);
    fragment.append(section);
  });
  return fragment;
}

function versionChangeEntry(change: ProductChangeLogEntry) {
  const entry = document.createElement('article');
  entry.className = 'productInspectorVersionEntry';
  const heading = document.createElement('div');
  heading.className = 'productInspectorVersionEntryHeading';
  const name = document.createElement('b');
  name.textContent = change.feature.parentName ? `${change.feature.parentName}.${change.feature.name}` : change.feature.name;
  heading.append(name, tag(scopeLabel(change.feature.scope)));
  const meta = document.createElement('span');
  meta.className = 'productInspectorVersionEntryMeta';
  meta.textContent = `${change.date} · ${eventLabel(change.event)}`;
  const summary = document.createElement('p');
  summary.textContent = change.summary;
  entry.append(heading, meta, summary);
  return entry;
}

function wikiTopic(topic: ResolvedProductReference, stacked: boolean) {
  const section = document.createElement('section');
  section.className = 'productInspectorTopic';
  const meta = document.createElement('div');
  meta.className = 'productInspectorTags';
  meta.append(
    tag(topic.module),
    tag(topic.title),
    tag(`产品：${statusLabel(topic.productStatus)}`),
    tag(`表面：${coverageLabel(topic.surfaceCoverage)}`),
  );
  if (stacked) meta.append(tag('祖先链'));
  const path = document.createElement('span');
  path.className = 'productInspectorPath';
  path.textContent = topic.path;
  if (topic.latestChange) {
    const change = document.createElement('p');
    change.className = 'productInspectorChange';
    change.textContent = `最近变更 ${topic.latestChange.version} · ${topic.latestChange.date} · ${topic.latestChange.summary}`;
    section.append(meta, path, change);
  } else {
    section.append(meta, path);
  }
  const article = document.createElement('article');
  article.className = 'productInspectorMarkdown';
  article.innerHTML = DOMPurify.sanitize(marked.parse(topic.markdown, { gfm: true }) as string);
  section.append(article);
  return section;
}

function scopeLabel(scope: ProductChangeLogEntry['feature']['scope']) {
  return ({ module: '模块', entity: '实体', field: '字段', view: '视图', rule: '规则' })[scope];
}

function eventLabel(event: ProductChangeLogEntry['event']) {
  return ({ baseline: '基线', introduced: '新增', changed: '修改', released: '发布', deprecated: '废弃', removed: '移除' })[event];
}

function statusLabel(status: ResolvedProductReference['productStatus']) {
  return ({ roadmap: '路线图', released: '已发布', deprecated: '已废弃' })[status];
}

function coverageLabel(coverage: ResolvedProductReference['surfaceCoverage']) {
  return ({ none: '未覆盖', partial: '部分覆盖', complete: '完整覆盖' })[coverage];
}

function emptyTopic(text: string) {
  const empty = document.createElement('p');
  empty.className = 'productInspectorEmpty';
  empty.textContent = text;
  return empty;
}

function tag(value: string) {
  const element = document.createElement('span');
  element.className = 'productInspectorTag';
  element.textContent = value;
  return element;
}

function iconButton(label: string, iconNode: IconNode) {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.append(icon(iconNode));
  return button;
}

function icon(iconNode: IconNode) {
  return createElement(iconNode, { width: 16, height: 16, 'aria-hidden': 'true' });
}
