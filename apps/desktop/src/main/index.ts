// 主进程入口文件
import 'reflect-metadata';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// 在ESM环境中导入Electron
import electron from 'electron';

const { app, BrowserWindow, ipcMain, shell, dialog } = electron;

// 导入数据库初始化功能
import { initDB, setupDatabaseCleanup } from '../database/init';
import { initIpcRouter } from './ipc-handlers';

// 是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

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

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: !isDev, // 开发环境下不自动显示窗口
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
      webSecurity: !isDev, // 开发环境下禁用Web安全限制
      allowRunningInsecureContent: isDev, // 允许加载不安全内容
    },
  });

  // 加载默认URL
  mainWindow.loadURL(DEFAULT_URL + '/growth/habit/habit-list');

  // 页面加载完成后再显示窗口，避免热更新时抢夺焦点
  mainWindow.webContents.once('did-finish-load', () => {
    if (isDev) {
      // 开发环境下延迟显示，避免热更新时抢夺焦点
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.showInactive(); // 显示但不获得焦点
      }
    } else {
      // 生产环境正常显示
      mainWindow.show();
    }
  });

  // 在开发环境中插入脚本解决跨域问题
  if (isDev) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents
        .executeJavaScript(
          `
        try {
          // 尝试放宽跨域限制
          document.domain = document.domain.split('.').slice(-2).join('.');
        } catch(e) {
          console.warn('设置document.domain失败:', e);
        }
      `
        )
        .catch((err) => console.error('执行脚本失败:', err));
    });
  }

  // 开发环境下打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 允许打开外部链接
  mainWindow.webContents.setWindowOpenHandler((details: { url: string }) => {
    if (details.url.startsWith('https://') || details.url.startsWith('http://')) {
      shell.openExternal(details.url);
    }
    return { action: 'deny' };
  });

  // 窗口关闭时释放引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当Electron完成初始化时创建窗口
app.whenReady().then(async () => {
  // 初始化数据库
  try {
    await initDB();
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }

  // 设置数据库清理
  setupDatabaseCleanup();

  // 注册 IPC 处理器
  initIpcRouter();

  createWindow();

  app.on('activate', () => {
    // 在macOS上，当点击dock图标且没有其他窗口打开时，通常需要在应用程序中重新创建一个窗口
    if (mainWindow === null) {
      createWindow();
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
  if (mainWindow) {
    await mainWindow.loadURL(url);
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

// 设置CSP安全策略
app.on('web-contents-created', (_, contents) => {
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
