import electron from 'electron';
import { labChannel } from '@true-north/dev-lab';
import { snapshotDevTrace, subscribeDevTrace } from '@true-north/dev-lab/collector';

const { ipcMain, WebContentsView } = electron;

const DEFAULT_SIDE_WIDTH = 420;
const MIN_DEVTOOLS_WIDTH = 320;
const MAX_SIDE_WIDTH = 720;
const MIN_APP_WIDTH = 480;
const HANDLE_WIDTH = 8;

const HANDLE_HTML = `<!doctype html><html><head><style>
html,body{margin:0;width:100%;height:100%;cursor:col-resize;background:transparent}
</style></head><body></body></html>`;

type ContentsView = InstanceType<typeof WebContentsView>;

type HostIpc = {
  onSetLabVisible: (visible: boolean) => void;
  onDragStart: (screenX?: number) => void;
  onDragMove: (screenX: number) => void;
  onDragEnd: (screenX?: number) => void;
};

let hostIpc: HostIpc | null = null;
let labIpcBound = false;

export type SideMode = 'lab' | 'devtools' | 'hidden';

export type InspectorHost = {
  attach: () => void;
  destroy: () => void;
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

  let labView: ContentsView | null = null;
  let devtoolsView: ContentsView | null = null;
  let handleView: ContentsView | null = null;
  let sideMode: SideMode = 'hidden';
  let hostedDevToolsOpen = false;
  let sideWidth = DEFAULT_SIDE_WIDTH;
  let dragging = false;
  let boundWindow: electron.BaseWindow | null = null;
  let boundAppContents: electron.WebContents | null = null;

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

  const labContents = () => labView?.webContents;
  const isDevToolsOpen = () => hostedDevToolsOpen || sideMode === 'devtools';
  const getSideMode = () => sideMode;
  const minSide = () => MIN_DEVTOOLS_WIDTH;
  const isNativeSideOpen = () => sideMode === 'lab' || sideMode === 'devtools';

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
    const labOpen = sideMode === 'lab';
    const dtOpen = sideMode === 'devtools';
    const sideOpen = labOpen || dtOpen;
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

  const startDrag = (screenX?: number) => {
    if (!isNativeSideOpen()) return;
    dragging = true;
    if (Number.isFinite(screenX)) applyDrag(Number(screenX));
  };

  const endDrag = (screenX?: number) => {
    if (!dragging) return;
    if (Number.isFinite(screenX)) applyDrag(Number(screenX));
    dragging = false;
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
      boundAppContents.removeListener('did-finish-load', onAppDidFinishLoad);
    }
    boundAppContents = null;
  };

  const onAppDidFinishLoad = () => {
    layout();
    options.onChanged?.();
  };

  const onDevToolsOpened = () => {
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
    contents.on('did-finish-load', onAppDidFinishLoad);
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
            window.sidePanelHandle?.dragStart(event.screenX);
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
    if (handleView) window.contentView.addChildView(handleView);
    if (labView) window.contentView.addChildView(labView);
    layout();
    options.onChanged?.();
  };

  const setSideMode = (mode: SideMode) => {
    if (mode === 'devtools') {
      toggleDevTools(true);
      return;
    }
    closeHostedDevTools();
    sideMode = mode;
    if (mode === 'hidden') {
      labView?.setVisible(false);
      if (dragging) endDrag();
    } else {
      attach();
    }
    layout();
    options.onChanged?.();
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
    onSetLabVisible: (visible) => {
      if (!visible) setSideMode('hidden');
    },
    onDragStart: startDrag,
    onDragMove: applyDrag,
    onDragEnd: endDrag,
  };

  if (!labIpcBound) {
    labIpcBound = true;
    ipcMain.on(labChannel.setVisible, (_event, visible: boolean) => hostIpc?.onSetLabVisible(visible));
    ipcMain.on('side-panel:drag-start', (_event, screenX: number) => {
      appContents()?.send('side-panel:drag-start');
      hostIpc?.onDragStart(screenX);
    });
    ipcMain.on('side-panel:drag-move', (_event, screenX: number) => hostIpc?.onDragMove(Number(screenX)));
    ipcMain.on('side-panel:drag-end', (_event, screenX?: number) => {
      appContents()?.send('side-panel:drag-end');
      hostIpc?.onDragEnd(screenX);
    });
  }

  return {
    attach,
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
        if (labView) window.contentView.removeChildView(labView);
        if (devtoolsView) window.contentView.removeChildView(devtoolsView);
        if (handleView) window.contentView.removeChildView(handleView);
        if (appView) {
          const [contentWidth, contentHeight] = window.getContentSize();
          appView.setBounds({ x: 0, y: 0, width: contentWidth, height: contentHeight });
        }
      }
      if (labView && !labView.webContents.isDestroyed()) labView.webContents.close();
      if (devtoolsView && !devtoolsView.webContents.isDestroyed()) devtoolsView.webContents.close();
      if (handleView && !handleView.webContents.isDestroyed()) handleView.webContents.close();
      labView = null;
      devtoolsView = null;
      handleView = null;
      sideMode = 'hidden';
    },
  };
}
