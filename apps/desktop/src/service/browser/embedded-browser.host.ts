import { randomUUID } from 'node:crypto';
import { session, WebContentsView, type BaseWindow, type WebContents } from 'electron';
import type { BrowserBoundsVo, BrowserExtractResultVo, BrowserStateVo, BrowserTabVo } from '@true-north/vo';
import {
  BROWSER_STATE_CHANNEL,
  EMBEDDED_BROWSER_PARTITION,
  NEW_TAB_TITLE,
  isAllowedBrowserUrl,
  normalizeBrowserUrl,
} from '@true-north/vo';
import { extractFromContents } from '../extract';

type SendFn = (channel: string, payload: BrowserStateVo) => void;

type HostAttach = {
  window: BaseWindow;
  send: SendFn;
};

type TabRecord = {
  id: string;
  title: string;
  url: string;
  loading: boolean;
  view: WebContentsView | null;
};

const EMPTY_BOUNDS: BrowserBoundsVo = { x: 0, y: 0, width: 0, height: 0 };

const VIEW_PREFERENCES = {
  sandbox: true,
  nodeIntegration: false,
  contextIsolation: true,
  webSecurity: true,
  partition: EMBEDDED_BROWSER_PARTITION,
};

function roundBounds(bounds: BrowserBoundsVo): BrowserBoundsVo {
  return {
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.max(0, Math.round(bounds.width)),
    height: Math.max(0, Math.round(bounds.height)),
  };
}

function navigationFlags(contents: WebContents | undefined): { canGoBack: boolean; canGoForward: boolean } {
  if (!contents || contents.isDestroyed()) return { canGoBack: false, canGoForward: false };
  const history = contents.navigationHistory;
  if (history) {
    return { canGoBack: history.canGoBack(), canGoForward: history.canGoForward() };
  }
  return { canGoBack: false, canGoForward: false };
}

export class EmbeddedBrowserHost {
  private window: BaseWindow | null = null;
  private send: SendFn | null = null;
  private visible = false;
  private activeTabId: string | null = null;
  private tabs: TabRecord[] = [];
  private bounds: BrowserBoundsVo = EMPTY_BOUNDS;
  private attached = new Set<WebContentsView>();
  private sessionGuarded = false;
  private resizeBound = false;

  attach(options: HostAttach): void {
    this.detach();
    this.window = options.window;
    this.send = options.send;
    if (!this.resizeBound) {
      this.window.on('resize', () => this.syncViews());
      this.resizeBound = true;
    }
    this.installSessionGuards();
    this.emitState();
  }

  detach(): void {
    for (const tab of this.tabs) {
      this.destroyView(tab);
    }
    this.tabs = [];
    this.activeTabId = null;
    this.visible = false;
    this.bounds = EMPTY_BOUNDS;
    this.attached.clear();
    this.window = null;
    this.send = null;
    this.resizeBound = false;
  }

  getState(): BrowserStateVo {
    return {
      visible: this.visible,
      activeTabId: this.activeTabId,
      tabs: this.tabs.map((tab) => this.toTabVo(tab)),
    };
  }

  setVisible(visible: boolean): BrowserStateVo {
    this.visible = visible;
    this.syncViews();
    return this.emitState();
  }

  setBounds(bounds: BrowserBoundsVo): BrowserStateVo {
    this.bounds = roundBounds(bounds);
    this.syncViews();
    return this.getState();
  }

  createTab(url?: string): BrowserStateVo {
    const tab = this.createTabInternal();
    if (url) {
      this.navigateTab(tab.id, url);
      return this.getState();
    }
    this.syncViews();
    return this.emitState();
  }

  closeTab(tabId: string): BrowserStateVo {
    const index = this.tabs.findIndex((tab) => tab.id === tabId);
    if (index < 0) return this.getState();
    const [removed] = this.tabs.splice(index, 1);
    if (removed) this.destroyView(removed);
    if (this.tabs.length === 0) {
      this.activeTabId = null;
    } else if (this.activeTabId === tabId) {
      const next = this.tabs[Math.min(index, this.tabs.length - 1)];
      this.activeTabId = next?.id ?? null;
    }
    this.syncViews();
    return this.emitState();
  }

  activateTab(tabId: string): BrowserStateVo {
    if (!this.tabs.some((tab) => tab.id === tabId)) return this.getState();
    this.activeTabId = tabId;
    this.syncViews();
    return this.emitState();
  }

  navigate(tabId: string, rawUrl: string): BrowserStateVo {
    this.navigateTab(tabId, rawUrl);
    return this.getState();
  }

  goBack(tabId: string): BrowserStateVo {
    const tab = this.requireTab(tabId);
    const contents = tab.view?.webContents;
    if (contents && !contents.isDestroyed() && navigationFlags(contents).canGoBack) {
      contents.navigationHistory.goBack();
    }
    return this.emitState();
  }

  goForward(tabId: string): BrowserStateVo {
    const tab = this.requireTab(tabId);
    const contents = tab.view?.webContents;
    if (contents && !contents.isDestroyed() && navigationFlags(contents).canGoForward) {
      contents.navigationHistory.goForward();
    }
    return this.emitState();
  }

  reload(tabId: string): BrowserStateVo {
    const tab = this.requireTab(tabId);
    const contents = tab.view?.webContents;
    if (contents && !contents.isDestroyed() && tab.url) {
      tab.loading = true;
      contents.reload();
    }
    return this.emitState();
  }

  async extractTab(tabId: string): Promise<BrowserExtractResultVo> {
    const tab = this.requireTab(tabId);
    const contents = tab.view?.webContents;
    const url = contents && !contents.isDestroyed() ? contents.getURL() || tab.url : tab.url;
    if (!url) throw new Error('当前标签没有打开的页面');
    if (!contents || contents.isDestroyed()) throw new Error('当前标签没有可抽取的页面');
    return extractFromContents(contents, url);
  }

  private createTabInternal(): TabRecord {
    const tab: TabRecord = {
      id: randomUUID(),
      title: NEW_TAB_TITLE,
      url: '',
      loading: false,
      view: null,
    };
    this.tabs.push(tab);
    this.activeTabId = tab.id;
    return tab;
  }

  private requireTab(tabId: string): TabRecord {
    const tab = this.tabs.find((item) => item.id === tabId);
    if (!tab) throw new Error('标签不存在');
    return tab;
  }

  private navigateTab(tabId: string, rawUrl: string): void {
    const url = normalizeBrowserUrl(rawUrl);
    if (!url) throw new Error('不是有效网址');
    const tab = this.requireTab(tabId);
    this.activeTabId = tabId;
    tab.url = url;
    tab.title = url;
    tab.loading = true;
    const view = this.ensureView(tab);
    this.syncViews();
    this.emitState();
    void view.webContents.loadURL(url).catch((error) => {
      console.error('内嵌浏览器打开失败', error);
      tab.loading = false;
      this.emitState();
    });
  }

  private ensureView(tab: TabRecord): WebContentsView {
    if (tab.view && !tab.view.webContents.isDestroyed()) return tab.view;
    const view = new WebContentsView({ webPreferences: VIEW_PREFERENCES });
    this.bindContents(tab.id, view.webContents);
    tab.view = view;
    return view;
  }

  private bindContents(tabId: string, contents: WebContents): void {
    contents.setWindowOpenHandler((details) => {
      if (isAllowedBrowserUrl(details.url)) {
        this.createTab(details.url);
      }
      return { action: 'deny' };
    });
    contents.on('will-navigate', (event, url) => {
      if (!isAllowedBrowserUrl(url)) event.preventDefault();
    });
    contents.on('will-redirect', (event, url) => {
      if (!isAllowedBrowserUrl(url)) event.preventDefault();
    });
    contents.on('page-title-updated', (_event, title) => {
      const tab = this.tabs.find((item) => item.id === tabId);
      if (!tab) return;
      tab.title = title.trim() || tab.url || NEW_TAB_TITLE;
      this.emitState();
    });
    contents.on('did-navigate', (_event, url) => {
      this.syncNavigation(tabId, url);
    });
    contents.on('did-navigate-in-page', (_event, url) => {
      this.syncNavigation(tabId, url);
    });
    contents.on('did-start-loading', () => {
      const tab = this.tabs.find((item) => item.id === tabId);
      if (!tab) return;
      tab.loading = true;
      this.emitState();
    });
    contents.on('did-stop-loading', () => {
      const tab = this.tabs.find((item) => item.id === tabId);
      if (!tab) return;
      tab.loading = false;
      this.emitState();
    });
    contents.on('did-fail-load', (_event, _code, _desc, _url, isMainFrame) => {
      if (!isMainFrame) return;
      const tab = this.tabs.find((item) => item.id === tabId);
      if (!tab) return;
      tab.loading = false;
      this.emitState();
    });
  }

  private syncNavigation(tabId: string, url: string): void {
    const tab = this.tabs.find((item) => item.id === tabId);
    if (!tab || !isAllowedBrowserUrl(url)) return;
    tab.url = url;
    if (!tab.title || tab.title === NEW_TAB_TITLE) tab.title = url;
    this.emitState();
  }

  private syncViews(): void {
    const active = this.tabs.find((tab) => tab.id === this.activeTabId);
    const showActive = this.visible && Boolean(active?.url) && Boolean(active?.view);
    for (const tab of this.tabs) {
      if (!tab.view) continue;
      const show = showActive && tab.id === this.activeTabId;
      if (show) this.showView(tab.view);
      else this.hideView(tab.view);
    }
  }

  private showView(view: WebContentsView): void {
    if (!this.window || this.window.isDestroyed()) return;
    const bounds = this.bounds;
    if (bounds.width <= 0 || bounds.height <= 0) {
      this.hideView(view);
      return;
    }
    if (!this.attached.has(view)) {
      this.window.contentView.addChildView(view);
      this.attached.add(view);
    }
    view.setBounds(bounds);
  }

  private hideView(view: WebContentsView): void {
    if (this.attached.has(view) && this.window && !this.window.isDestroyed()) {
      this.window.contentView.removeChildView(view);
    }
    this.attached.delete(view);
    view.setBounds(EMPTY_BOUNDS);
  }

  private destroyView(tab: TabRecord): void {
    const view = tab.view;
    tab.view = null;
    if (!view) return;
    this.hideView(view);
    const contents = view.webContents;
    if (!contents.isDestroyed()) contents.close();
  }

  private installSessionGuards(): void {
    if (this.sessionGuarded) return;
    const ses = session.fromPartition(EMBEDDED_BROWSER_PARTITION);
    ses.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    ses.setPermissionCheckHandler(() => false);
    this.sessionGuarded = true;
  }

  private toTabVo(tab: TabRecord): BrowserTabVo {
    const flags = navigationFlags(tab.view?.webContents);
    return {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      loading: tab.loading,
      canGoBack: flags.canGoBack,
      canGoForward: flags.canGoForward,
    };
  }

  private emitState(): BrowserStateVo {
    const state = this.getState();
    this.send?.(BROWSER_STATE_CHANNEL, state);
    return state;
  }
}

export const embeddedBrowserHost = new EmbeddedBrowserHost();
