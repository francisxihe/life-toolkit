// 主进程入口文件
import 'reflect-metadata';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// 在ESM环境中导入Electron
import electron from 'electron';

const { app, BaseWindow, BrowserWindow, Menu, WebContentsView, ipcMain, nativeTheme, session, shell } = electron;

// 导入数据库初始化功能
import { initIpcRouter } from './ipc-handlers';
import { bootPluginPlatform, startHostMcp } from '../plugin/host';
import { setupDatabaseCleanup } from '../service/db/init';
import { embeddedBrowserHost } from '../service/browser';
import { EMBEDDED_BROWSER_PARTITION } from '@true-north/vo';
import { labChannel } from '@true-north/dev-lab';
import { subscribeDevTrace } from '@true-north/dev-lab/collector';

// 是否为开发环境
const isDev = process.env.NODE_ENV === 'development';
const isProductDev = isDev && process.env.TN_DEV_PROFILE === 'product';
const isLabDev = isDev && !isProductDev;

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

// 输出路径信息，便于调试
console.log('当前文件路径:', currentFilePath);
console.log('当前目录路径:', currentDirPath);
console.log('[热加载测试] 主进程已启动');

// 获取最终的预加载脚本路径
function getPreloadPath() {
  // 可能的预加载脚本路径
  const possiblePaths = [
    path.join(currentDirPath, '../../dist/preload/index.cjs'),
    path.join(currentDirPath, '../preload/index.cjs'),
    path.join(process.cwd(), 'dist/preload/index.cjs'),
    path.join(__dirname, '../../dist/preload/index.cjs'),
    path.join(__dirname, '../preload/index.cjs'),
  ];

  // 检查每个可能的路径
  for (const p of possiblePaths) {
    console.log('检查预加载脚本路径:', p);
    try {
      if (fs.existsSync(p)) {
        console.log('找到预加载脚本:', p);
        return p;
      }
    } catch (error) {
      console.error('检查路径出错:', p, error);
    }
  }

  // 找不到预加载脚本，返回默认路径
  console.warn('找不到预加载脚本，使用默认路径');
  return path.join(currentDirPath, isDev ? '../../dist/preload/index.cjs' : '../preload/index.cjs');
}

// electron-vite 已经提供了内置的热加载机制，无需手动实现

// 保持对window对象的全局引用
let mainWindow = null;
let appView = null;
let wikiDockPreferred = isProductDev;
let labDockPreferred = false;

// 默认加载的URL - 使用渲染进程的开发服务器
let DEFAULT_URL: string;
if (isDev) {
  if (process.env.ELECTRON_RENDERER_URL) {
    DEFAULT_URL = process.env.ELECTRON_RENDERER_URL;
  } else {
    DEFAULT_URL = 'http://localhost:8100/';
  }
} else {
  DEFAULT_URL = `file://${path.join(__dirname, '../renderer/index.html')}`;
}

function appContents() {
  if (appView && !appView.webContents.isDestroyed()) return appView.webContents;
  if (mainWindow instanceof BrowserWindow) return mainWindow.webContents;
  return null;
}

function sendDevDock(tab, visible) {
  const contents = appContents();
  if (!contents) return;
  const preferred = visible ? { tab, visible: true } : { tab, visible: false };
  contents
    .executeJavaScript(
      `window.__devDockPreferred = ${JSON.stringify(preferred)};
       if (${JSON.stringify(visible)}) window.__devDock?.activate(${JSON.stringify(tab)});
       else window.__devDock?.setVisible(false);`,
    )
    .catch((error) => console.warn('无法切换 DEV dock', error));
}

function setWikiDockPreferred(visible) {
  wikiDockPreferred = visible;
  if (visible) labDockPreferred = false;
  sendDevDock('wiki', visible);
  installDevMenu();
}

function setLabDockPreferred(visible) {
  labDockPreferred = visible;
  if (visible) wikiDockPreferred = false;
  sendDevDock('lab', visible);
  installDevMenu();
}

function syncDevChrome() {
  if (isProductDev) {
    sendDevDock('wiki', wikiDockPreferred);
  } else if (isLabDev) {
    sendDevDock('lab', labDockPreferred);
  }
  installDevMenu();
}

function installDevMenu() {
  const isMac = process.platform === 'darwin';
  const withAppContents = (run) => {
    const contents = appContents();
    if (contents) run(contents);
  };
  const macAppMenu: electron.MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
      ]
    : [];
  const productWikiMenu: electron.MenuItemConstructorOptions[] = isProductDev
    ? [
        {
          label: 'ProductWiki',
          type: 'checkbox',
          checked: wikiDockPreferred,
          click: (item) => {
            setWikiDockPreferred(item.checked);
          },
        },
      ]
    : [];
  const labMenu: electron.MenuItemConstructorOptions[] = isLabDev
    ? [
        {
          label: 'Lab',
          type: 'checkbox',
          checked: labDockPreferred,
          click: (item) => {
            setLabDockPreferred(item.checked);
          },
        },
      ]
    : [];
  const template: electron.MenuItemConstructorOptions[] = [
    ...macAppMenu,
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => withAppContents((contents) => contents.reload()),
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => withAppContents((contents) => contents.reloadIgnoringCache()),
        },
        { type: 'separator' },
        ...productWikiMenu,
        ...labMenu,
        {
          label: 'Toggle Developer Tools',
          accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => appContents()?.toggleDevTools(),
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => withAppContents((contents) => contents.setZoomLevel(0)),
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => withAppContents((contents) => contents.setZoomLevel(contents.getZoomLevel() + 0.5)),
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => withAppContents((contents) => contents.setZoomLevel(contents.getZoomLevel() - 0.5)),
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  const webPreferences = {
    nodeIntegration: false,
    contextIsolation: true,
    preload: getPreloadPath(),
    webSecurity: !isDev,
    allowRunningInsecureContent: isDev,
  };

  if (isDev) {
    mainWindow = new BaseWindow({
      width: 1200,
      height: 800,
      show: false,
    });
    appView = new WebContentsView({ webPreferences });
    mainWindow.contentView.addChildView(appView);
    const layoutAppView = () => {
      if (!mainWindow || mainWindow.isDestroyed() || !appView) return;
      const [contentWidth, contentHeight] = mainWindow.getContentSize();
      appView.setBounds({ x: 0, y: 0, width: contentWidth, height: contentHeight });
    };
    layoutAppView();
    mainWindow.on('resize', layoutAppView);
    const contents = appView.webContents;
    contents.loadURL(DEFAULT_URL + '#/ai');
    contents.once('did-finish-load', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.showInactive();
      }
      if (isLabDev) {
        contents.openDevTools();
      }
      syncDevChrome();
    });
    contents.on('did-finish-load', () => {
      contents
        .executeJavaScript(
          `
        try {
          document.domain = document.domain.split('.').slice(-2).join('.');
        } catch(e) {
          console.warn('设置document.domain失败:', e);
        }
      `
        )
        .catch((err) => console.error('执行脚本失败:', err));
    });
    contents.setWindowOpenHandler((details: { url: string }) => {
      if (details.url.startsWith('https://') || details.url.startsWith('http://')) {
        shell.openExternal(details.url);
      }
      return { action: 'deny' };
    });
  } else {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      webPreferences,
    });
    mainWindow.loadURL(DEFAULT_URL);
    mainWindow.webContents.once('did-finish-load', () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
    });
    mainWindow.webContents.setWindowOpenHandler((details: { url: string }) => {
      if (details.url.startsWith('https://') || details.url.startsWith('http://')) {
        shell.openExternal(details.url);
      }
      return { action: 'deny' };
    });
  }

  embeddedBrowserHost.attach({
    window: mainWindow,
    send: (channel, payload) => {
      const contents = appContents();
      if (contents && !contents.isDestroyed()) contents.send(channel, payload);
    },
  });

  mainWindow.on('closed', () => {
    embeddedBrowserHost.detach();
    appView = null;
    mainWindow = null;
  });
}

// 当Electron完成初始化时创建窗口
app.whenReady().then(async () => {
  try {
    await bootPluginPlatform();
    console.log('插件平台与数据库初始化完成');
  } catch (error) {
    console.error('插件平台初始化失败:', error);
    app.exit(1);
    return;
  }

  setupDatabaseCleanup();
  initIpcRouter();

  try {
    const mcpPort = await startHostMcp();
    console.log('Loopback MCP 已启动', `127.0.0.1:${mcpPort}`);
  } catch (error) {
    console.error('Loopback MCP 启动失败:', error);
  }

  createWindow();
  if (isLabDev) {
    subscribeDevTrace((snapshot) => {
      const contents = appContents();
      if (!contents || contents.isDestroyed()) return;
      contents.send(labChannel.update, snapshot);
    });
    ipcMain.on(labChannel.setVisible, (_event, visible) => {
      setLabDockPreferred(Boolean(visible));
    });
  }
  if (isDev) {
    syncDevChrome();
  }

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
      if (isDev) syncDevChrome();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，用户通常希望应用在点X后继续运行，直到明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 提供加载新URL的方法
ipcMain.handle('load-url', async (_: any, url: string) => {
  const contents = appContents();
  if (contents) {
    await contents.loadURL(url);
    return { success: true };
  }
  return { success: false, error: '窗口未创建' };
});

// 提供获取应用信息的方法
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
  };
});

ipcMain.handle('set-native-theme-source', (_event, source: string) => {
  if (source !== 'system' && source !== 'light' && source !== 'dark') return;
  nativeTheme.themeSource = source;
});

// 设置CSP安全策略
app.on('web-contents-created', (_, contents) => {
  if (contents.session === session.fromPartition(EMBEDDED_BROWSER_PARTITION)) return;
  // 开发环境中，关闭CSP校验
  if (isDev) {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // 删除任何现有的CSP头
          'Content-Security-Policy': [''],
        },
      });
    });
  } else {
    // 生产环境中设置严格的CSP
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; connect-src 'self' https://*; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';",
          ],
        },
      });
    });
  }
});
