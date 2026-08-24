import electron from 'electron';
import { labChannel } from '@true-north/dev-lab';
import { snapshotDevTrace, subscribeDevTrace } from '@true-north/dev-lab/collector';

const { ipcMain, WebContentsView } = electron;

const CHANNELS = {
  selection: 'product-wiki:selection',
  pageContext: 'product-wiki:page-context',
  requestPageContext: 'product-wiki:request-page-context',
  cancel: 'product-wiki:cancel',
  setSelecting: 'product-wiki:set-selecting',
  setHighlightVisible: 'product-wiki:set-highlight-visible',
  setVisible: 'product-wiki:set-visible',
  splitterCapturing: 'product-wiki:splitter-capturing',
  splitterDragStart: 'product-wiki:splitter-drag-start',
  splitterDragMove: 'product-wiki:splitter-drag-move',
  splitterDragEnd: 'product-wiki:splitter-drag-end',
} as const;

const DEFAULT_SIDE_WIDTH = 420;
const MIN_WIKI_WIDTH = 360;
const MIN_DEVTOOLS_WIDTH = 320;
const MAX_SIDE_WIDTH = 720;
const MIN_APP_WIDTH = 480;
const HANDLE_WIDTH = 8;

const HANDLE_HTML = `<!doctype html><html><head><style>
html,body{margin:0;width:100%;height:100%;cursor:col-resize;background:transparent}
</style></head><body></body></html>`;

type ContentsView = InstanceType<typeof WebContentsView>;

type HostIpc = {
  onSelection: (payload: unknown) => void;
  onPageContext: (payload: unknown) => void;
  onRequestPageContext: () => void;
  onCancel: () => void;
  onSetSelecting: (selecting: boolean) => void;
  onSetHighlightVisible: (visible: boolean) => void;
  onSetVisible: (visible: boolean) => void;
  onSetLabVisible: (visible: boolean) => void;
  onDragStart: (screenX?: number) => void;
  onDragMove: (screenX: number) => void;
  onDragEnd: (screenX?: number) => void;
};

let hostIpc: HostIpc | null = null;
let inspectorIpcRegistered = false;

export type SideMode = 'wiki' | 'lab' | 'devtools' | 'hidden';

export type InspectorHost = {
  attach: () => void;
  destroy: () => void;
  setVisible: (visible: boolean) => void;
  isVisible: () => boolean;
  setSideMode: (mode: SideMode) => void;
  getSideMode: () => SideMode;
  toggleDevTools: () => void;
  isDevToolsOpen: () => boolean;
};

export function createProductWikiInspectorHost(options: {
  isDev: boolean;
  getMainWindow: () => electron.BaseWindow | electron.BrowserWindow | null;
  getAppView: () => ContentsView | null;
  getPreloadPath: () => string;
  rendererUrl: string;
  onChanged?: () => void;
}): InspectorHost | undefined {
  if (!options.isDev) return undefined;

  let inspectorView: ContentsView | null = null;
  let labView: ContentsView | null = null;
  let devtoolsView: ContentsView | null = null;
  let handleView: ContentsView | null = null;
  let sideMode: SideMode = 'wiki';
  let hostedDevToolsOpen = false;
  let sideWidth = DEFAULT_SIDE_WIDTH;
  let dragging = false;
  let boundWindow: electron.BaseWindow | null = null;
  let boundAppContents: electron.WebContents | null = null;

  const inspectorUrl = () => {
    const page = '/ProductWiki.html';
    if (process.env.ELECTRON_RENDERER_URL) {
      return `${process.env.ELECTRON_RENDERER_URL.replace(/\/$/, '')}${page}`;
    }
    if (options.rendererUrl.startsWith('http')) {
      return `${options.rendererUrl.replace(/\/$/, '')}${page}`;
    }
    return `${options.rendererUrl.replace(/index\.html$/, '')}ProductWiki.html`;
  };

  const labUrl = () => {
    const page = '/Lab.html';
    if (process.env.ELECTRON_RENDERER_URL) {
      return `${process.env.ELECTRON_RENDERER_URL.replace(/\/$/, '')}${page}`;
    }
    if (options.rendererUrl.startsWith('http')) {
      return `${options.rendererUrl.replace(/\/$/, '')}${page}`;
    }
    return `${options.rendererUrl.replace(/index\.html$/, '')}Lab.html`;
  };

  const sendToWebContents = (contents: electron.WebContents | undefined, channel: string, payload?: unknown) => {
    if (!contents || contents.isDestroyed()) return;
    contents.send(channel, payload);
  };

  const appContents = () => {
    const view = options.getAppView();
    if (!view || view.webContents.isDestroyed()) return undefined;
    return view.webContents;
  };

  const inspectorContents = () => inspectorView?.webContents;
  const labContents = () => labView?.webContents;
  const handleContents = () => handleView?.webContents;
  const broadcastCancel = () => {
    sendToWebContents(appContents(), CHANNELS.cancel);
    sendToWebContents(inspectorContents(), CHANNELS.cancel);
    sendToWebContents(appContents(), CHANNELS.setSelecting, false);
  };
  const requestPageContext = () => {
    sendToWebContents(appContents(), CHANNELS.requestPageContext);
  };
  const sendToInspector = (channel: string, payload?: unknown) => {
    const contents = inspectorContents();
    const send = () => sendToWebContents(contents, channel, payload);
    if (contents?.isLoading()) contents.once('did-finish-load', send);
    else send();
  };
  const cancelWikiIfLeaving = (next: SideMode) => {
    if (sideMode === 'wiki' && next !== 'wiki') broadcastCancel();
  };
  const isDevToolsOpen = () => hostedDevToolsOpen || sideMode === 'devtools';
  const isVisible = () => sideMode === 'wiki' && Boolean(inspectorView);
  const getSideMode = () => sideMode;
  const minSide = () => (isDevToolsOpen() ? MIN_DEVTOOLS_WIDTH : MIN_WIKI_WIDTH);
  const isSideOpen = () => sideMode === 'wiki' || sideMode === 'lab' || sideMode === 'devtools';

  const broadcast = (channel: string, payload?: unknown) => {
    sendToWebContents(appContents(), channel, payload);
    sendToWebContents(inspectorContents(), channel, payload);
    sendToWebContents(handleContents(), channel, payload);
  };

  const clamp = (value: number, min: number, max: number) => {
    if (max < min) return min;
    return Math.min(max, Math.max(min, value));
  };

  const viewPrefs = () => ({
    nodeIntegration: false,
    contextIsolation: true,
    preload: options.getPreloadPath(),
    webSecurity: false,
  });

  const layout = () => {
    const window = options.getMainWindow();
    const appView = options.getAppView();
    if (!window || window.isDestroyed() || !appView) return;
    const [contentWidth, contentHeight] = window.getContentSize();
    const wikiOpen = sideMode === 'wiki';
    const labOpen = sideMode === 'lab';
    const dtOpen = sideMode === 'devtools';
    const sideOpen = wikiOpen || labOpen || dtOpen;
    let side = sideOpen ? clamp(Math.round(sideWidth), minSide(), MAX_SIDE_WIDTH) : 0;
    let app = contentWidth - side;
    if (sideOpen && app < MIN_APP_WIDTH) {
      side = Math.max(minSide(), side - (MIN_APP_WIDTH - app));
      app = contentWidth - side;
    }
    app = Math.max(0, app);
    appView.setBounds({ x: 0, y: 0, width: app, height: contentHeight });
    if (handleView) {
      handleView.setVisible(sideOpen);
      handleView.setBounds(
        sideOpen
          ? { x: Math.max(0, app - HANDLE_WIDTH), y: 0, width: HANDLE_WIDTH, height: contentHeight }
          : { x: contentWidth, y: 0, width: 0, height: contentHeight },
      );
    }
    const sideX = app;
    if (inspectorView) {
      inspectorView.setVisible(wikiOpen);
      inspectorView.setBounds({
        x: wikiOpen ? sideX : contentWidth,
        y: 0,
        width: wikiOpen ? side : 0,
        height: contentHeight,
      });
    }
    if (labView) {
      labView.setVisible(labOpen);
      labView.setBounds({
        x: labOpen ? sideX : contentWidth,
        y: 0,
        width: labOpen ? side : 0,
        height: contentHeight,
      });
    }
    if (devtoolsView) {
      if (dtOpen && side > 0) {
        devtoolsView.setVisible(true);
        devtoolsView.setBounds({ x: sideX, y: 0, width: side, height: contentHeight });
      } else {
        devtoolsView.setVisible(false);
        devtoolsView.setBounds({ x: contentWidth, y: 0, width: 0, height: contentHeight });
      }
    }
  };

  const applyDrag = (screenX: number) => {
    const window = options.getMainWindow();
    if (!window || window.isDestroyed() || !Number.isFinite(screenX)) return;
    const [contentWidth] = window.getContentSize();
    const cursorX = screenX - window.getContentBounds().x;
    sideWidth = clamp(contentWidth - cursorX, minSide(), MAX_SIDE_WIDTH);
    layout();
  };

  const setCapturing = (on: boolean) => {
    dragging = on;
    broadcast(CHANNELS.splitterCapturing, on);
  };

  const startDrag = (screenX?: number) => {
    if (!isSideOpen()) return;
    setCapturing(true);
    if (Number.isFinite(screenX)) applyDrag(Number(screenX));
  };

  const endDrag = (screenX?: number) => {
    if (!dragging) return;
    if (Number.isFinite(screenX)) applyDrag(Number(screenX));
    setCapturing(false);
    sendToWebContents(inspectorContents(), CHANNELS.splitterDragEnd);
    sendToWebContents(handleContents(), CHANNELS.splitterDragEnd);
  };

  const closeHostedDevTools = () => {
    const contents = appContents();
    if (hostedDevToolsOpen) contents?.closeDevTools();
    hostedDevToolsOpen = false;
  };

  const unbindWindow = () => {
    if (boundWindow) {
      boundWindow.removeListener('resize', layout);
      boundWindow = null;
    }
    if (boundAppContents && !boundAppContents.isDestroyed()) {
      boundAppContents.removeListener('devtools-opened', onDevToolsOpened);
      boundAppContents.removeListener('devtools-closed', onDevToolsClosed);
      boundAppContents.removeListener('did-finish-load', layout);
    }
    boundAppContents = null;
  };

  const onDevToolsOpened = () => {
    cancelWikiIfLeaving('devtools');
    hostedDevToolsOpen = true;
    sideMode = 'devtools';
    layout();
    options.onChanged?.();
  };

  const onDevToolsClosed = () => {
    hostedDevToolsOpen = false;
    if (sideMode === 'devtools') sideMode = 'hidden';
    if (dragging) endDrag();
    layout();
    options.onChanged?.();
  };

  const bindWindow = (window: electron.BaseWindow, contents: electron.WebContents) => {
    if (boundWindow === window && boundAppContents === contents) return;
    unbindWindow();
    window.on('resize', layout);
    contents.on('devtools-opened', onDevToolsOpened);
    contents.on('devtools-closed', onDevToolsClosed);
    contents.on('did-finish-load', layout);
    boundWindow = window;
    boundAppContents = contents;
  };

  const bindHandleInput = (contents: electron.WebContents) => {
    contents
      .executeJavaScript(
        `(() => {
          if (window.__productWikiSideHandle) return;
          window.__productWikiSideHandle = true;
          document.addEventListener('mousedown', (event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            window.productWikiInspectorPanel?.sendSplitterDragStart('left', event.screenX);
          });
        })();`,
      )
      .catch((error) => console.warn('无法绑定右侧分栏把手', error));
  };

  const ensureHandleView = (window: electron.BaseWindow) => {
    if (handleView && !handleView.webContents.isDestroyed()) return;
    handleView = new WebContentsView({ webPreferences: viewPrefs() });
    handleView.setBackgroundColor('#00000000');
    handleView.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(HANDLE_HTML)}`);
    handleView.webContents.on('did-finish-load', () => {
      if (handleView && !handleView.webContents.isDestroyed()) bindHandleInput(handleView.webContents);
    });
    window.contentView.addChildView(handleView);
  };

  const ensureDevToolsView = (window: electron.BaseWindow) => {
    if (devtoolsView && !devtoolsView.webContents.isDestroyed()) return;
    devtoolsView = new WebContentsView();
    window.contentView.addChildView(devtoolsView);
  };

  const pushLabSnapshot = (snapshot: unknown) => {
    sendToWebContents(labContents(), labChannel.update, snapshot);
  };

  const unsubscribeTrace = subscribeDevTrace(pushLabSnapshot);

  const ensureLabView = (window: electron.BaseWindow) => {
    if (labView && !labView.webContents.isDestroyed()) return;
    labView = new WebContentsView({ webPreferences: viewPrefs() });
    labView.setVisible(false);
    labView.webContents.loadURL(labUrl());
    labView.webContents.on('did-finish-load', () => {
      pushLabSnapshot(snapshotDevTrace());
    });
    window.contentView.addChildView(labView);
  };

  const attach = () => {
    const window = options.getMainWindow();
    const appView = options.getAppView();
    if (!window || window.isDestroyed() || !appView || appView.webContents.isDestroyed()) return;
    const contents = appView.webContents;
    bindWindow(window, contents);
    ensureDevToolsView(window);
    ensureHandleView(window);
    ensureLabView(window);

    if (inspectorView && !inspectorView.webContents.isDestroyed()) {
      inspectorView.setVisible(isVisible());
      if (handleView) window.contentView.addChildView(handleView);
      if (labView) window.contentView.addChildView(labView);
      layout();
      if (isVisible()) requestPageContext();
      return;
    }

    inspectorView = new WebContentsView({ webPreferences: viewPrefs() });
    inspectorView.webContents.loadURL(inspectorUrl());
    inspectorView.webContents.on('did-finish-load', () => {
      if (sideMode === 'wiki') requestPageContext();
    });
    window.contentView.addChildView(inspectorView);
    if (labView) window.contentView.addChildView(labView);
    if (handleView) window.contentView.addChildView(handleView);
    inspectorView.setVisible(isVisible());
    layout();
  };

  const setSideMode = (mode: SideMode) => {
    cancelWikiIfLeaving(mode);
    if (mode === 'devtools') {
      toggleDevTools(true);
      return;
    }
    closeHostedDevTools();
    sideMode = mode;
    if (mode === 'hidden') {
      inspectorView?.setVisible(false);
      labView?.setVisible(false);
      if (dragging) endDrag();
    } else {
      attach();
    }
    layout();
    if (mode === 'wiki') requestPageContext();
    options.onChanged?.();
  };

  const setVisible = (visible: boolean) => {
    setSideMode(visible ? 'wiki' : 'hidden');
  };

  function toggleDevTools(forceOpen?: boolean) {
    const window = options.getMainWindow();
    const contents = appContents();
    if (!window || window.isDestroyed() || !contents) return;
    bindWindow(window, contents);
    ensureDevToolsView(window);
    ensureHandleView(window);
    ensureLabView(window);
    if (!devtoolsView) return;
    if (hostedDevToolsOpen && !forceOpen) {
      closeHostedDevTools();
      sideMode = 'hidden';
      if (dragging) endDrag();
      layout();
      options.onChanged?.();
      return;
    }
    if (hostedDevToolsOpen && forceOpen) {
      sideMode = 'devtools';
      layout();
      options.onChanged?.();
      return;
    }
    cancelWikiIfLeaving('devtools');
    inspectorView?.setVisible(false);
    labView?.setVisible(false);
    try {
      contents.setDevToolsWebContents(devtoolsView.webContents);
    } catch (error) {
      console.warn('无法把 DevTools 挂进右侧 view', error);
    }
    hostedDevToolsOpen = true;
    sideMode = 'devtools';
    layout();
    contents.openDevTools({ mode: 'detach' });
    options.onChanged?.();
  }

  hostIpc = {
    onSelection: (payload) => {
      setVisible(true);
      sendToInspector(CHANNELS.selection, payload);
    },
    onPageContext: (payload) => {
      sendToInspector(CHANNELS.pageContext, payload);
    },
    onRequestPageContext: () => {
      requestPageContext();
    },
    onCancel: () => {
      broadcastCancel();
    },
    onSetSelecting: (selecting) => {
      sendToWebContents(appContents(), CHANNELS.setSelecting, selecting);
    },
    onSetHighlightVisible: (visible) => {
      sendToWebContents(appContents(), CHANNELS.setHighlightVisible, Boolean(visible));
    },
    onSetVisible: (visible) => setVisible(Boolean(visible)),
    onSetLabVisible: (visible) => {
      if (!visible) setSideMode('hidden');
    },
    onDragStart: startDrag,
    onDragMove: applyDrag,
    onDragEnd: endDrag,
  };

  if (!inspectorIpcRegistered) {
    inspectorIpcRegistered = true;
    ipcMain.on(CHANNELS.selection, (_event, payload) => hostIpc?.onSelection(payload));
    ipcMain.on(CHANNELS.pageContext, (_event, payload) => hostIpc?.onPageContext(payload));
    ipcMain.on(CHANNELS.requestPageContext, () => hostIpc?.onRequestPageContext());
    ipcMain.on(CHANNELS.cancel, () => hostIpc?.onCancel());
    ipcMain.on(CHANNELS.setSelecting, (_event, selecting: boolean) => hostIpc?.onSetSelecting(selecting));
    ipcMain.on(CHANNELS.setHighlightVisible, (_event, visible: boolean) =>
      hostIpc?.onSetHighlightVisible(visible),
    );
    ipcMain.on(CHANNELS.setVisible, (_event, visible: boolean) => hostIpc?.onSetVisible(visible));
    ipcMain.on(labChannel.setVisible, (_event, visible: boolean) => hostIpc?.onSetLabVisible(visible));
    ipcMain.on(CHANNELS.splitterDragStart, (_event, payload) => {
      const screenX = typeof payload === 'number' ? payload : Number(payload?.screenX);
      hostIpc?.onDragStart(screenX);
    });
    ipcMain.on(CHANNELS.splitterDragMove, (_event, screenX: number) => hostIpc?.onDragMove(screenX));
    ipcMain.on(CHANNELS.splitterDragEnd, (_event, screenX?: number) => hostIpc?.onDragEnd(screenX));
  }

  return {
    attach,
    setVisible,
    isVisible,
    setSideMode,
    getSideMode,
    toggleDevTools,
    isDevToolsOpen,
    destroy: () => {
      const window = options.getMainWindow();
      const appView = options.getAppView();
      if (hostIpc?.onDragStart === startDrag) hostIpc = null;
      unsubscribeTrace();
      unbindWindow();
      dragging = false;
      closeHostedDevTools();
      if (window && !window.isDestroyed()) {
        if (inspectorView) window.contentView.removeChildView(inspectorView);
        if (labView) window.contentView.removeChildView(labView);
        if (devtoolsView) window.contentView.removeChildView(devtoolsView);
        if (handleView) window.contentView.removeChildView(handleView);
        if (appView) {
          const [contentWidth, contentHeight] = window.getContentSize();
          appView.setBounds({ x: 0, y: 0, width: contentWidth, height: contentHeight });
        }
      }
      if (inspectorView && !inspectorView.webContents.isDestroyed()) inspectorView.webContents.close();
      if (labView && !labView.webContents.isDestroyed()) labView.webContents.close();
      if (devtoolsView && !devtoolsView.webContents.isDestroyed()) devtoolsView.webContents.close();
      if (handleView && !handleView.webContents.isDestroyed()) handleView.webContents.close();
      inspectorView = null;
      labView = null;
      devtoolsView = null;
      handleView = null;
      sideMode = 'wiki';
    },
  };
}
