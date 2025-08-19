// 主进程入口文件
import 'reflect-metadata'
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// 在ESM环境中导入Electron
import electron from "electron";

const { app, BrowserWindow, ipcMain, shell, dialog } = electron;

// 导入数据库初始化功能
import { initDB, setupDatabaseCleanup } from '../database/init'
import { registerIpcHandlers } from './ipc-handlers';

// 是否为开发环境
const isDev = process.env.NODE_ENV === "development";

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

// 输出路径信息，便于调试
console.log("当前文件路径:", currentFilePath);
console.log("当前目录路径:", currentDirPath);

// 获取最终的预加载脚本路径
function getPreloadPath() {
  // 可能的预加载脚本路径
  const possiblePaths = [
    path.join(currentDirPath, "../../dist/preload/index.cjs"),
    path.join(currentDirPath, "../preload/index.cjs"),
    path.join(process.cwd(), "dist/preload/index.cjs"),
    path.join(__dirname, "../../dist/preload/index.cjs"),
    path.join(__dirname, "../preload/index.cjs"),
  ];

  // 检查每个可能的路径
  for (const p of possiblePaths) {
    console.log("检查预加载脚本路径:", p);
    try {
      if (fs.existsSync(p)) {
        console.log("找到预加载脚本:", p);
        return p;
      }
    } catch (error) {
      console.error("检查路径出错:", p, error);
    }
  }

  // 找不到预加载脚本，返回默认路径
  console.warn("找不到预加载脚本，使用默认路径");
  return path.join(
    currentDirPath,
    isDev ? "../../dist/preload/index.cjs" : "../preload/index.cjs"
  );
}

// 在开发环境下，监听主进程与数据库相关代码变更并重启应用
function setupDevHotReload() {
  if (!isDev) return;

  // 解析 dist/main 目录（监听构建产物，确保在重编译完成后再重启）
  function resolveDistMainPath(): string | null {
    const candidates = [
      path.resolve(currentDirPath, "../../dist/main"),
      path.resolve(currentDirPath, "../main"),
      path.resolve(process.cwd(), "dist/main"),
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) return p;
      } catch {}
    }
    return null;
  }

  // 当构建产物变化时再重启，避免源文件变更导致的提前重启而加载到旧代码
  let timer: NodeJS.Timeout | null = null;
  const debounceMs = 600;
  const scheduleRelaunch = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log("[DEV] 检测到主进程构建产物变更，正在重启应用...");
      app.relaunch();
      app.exit(0);
    }, debounceMs);
  };

  const startWatchingDistMain = (dir: string) => {
    try {
      fs.watch(dir, { recursive: true }, (_event, filename) => {
        if (!filename) return;
        if (/\.(js|cjs|mjs|map)$/.test(String(filename))) {
          scheduleRelaunch();
        }
      });
      console.log("[DEV] 已启用构建产物监听:", dir);
    } catch (e) {
      console.warn("[DEV] 监听构建产物失败:", dir, e);
    }
  };

  const distMain = resolveDistMainPath();
  if (distMain) {
    startWatchingDistMain(distMain);
  } else {
    console.warn("[DEV] 未找到 dist/main 目录，等待构建产物生成后再附加监听...");
    const interval = setInterval(() => {
      const p = resolveDistMainPath();
      if (p) {
        clearInterval(interval);
        startWatchingDistMain(p);
      }
    }, 1000);
  }
}

// 保持对window对象的全局引用
let mainWindow = null;

// 默认加载的URL
const DEFAULT_URL = "http://localhost:8080/growth/todo/todo-today";

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
      webSecurity: !isDev, // 开发环境下禁用Web安全限制
      allowRunningInsecureContent: isDev, // 允许加载不安全内容
    },
  });

  // 加载默认URL
  mainWindow.loadURL(DEFAULT_URL);

  // 在开发环境中插入脚本解决跨域问题
  if (isDev) {
    mainWindow.webContents.on("did-finish-load", () => {
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
        .catch((err) => console.error("执行脚本失败:", err));
    });
  }

  // 开发环境下打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 允许打开外部链接
  mainWindow.webContents.setWindowOpenHandler((details: { url: string }) => {
    if (
      details.url.startsWith("https://") ||
      details.url.startsWith("http://")
    ) {
      shell.openExternal(details.url);
    }
    return { action: "deny" };
  });

  // 窗口关闭时释放引用
  mainWindow.on("closed", () => {
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
  setupDatabaseCleanup()

  // 注册 IPC 处理器
  registerIpcHandlers();

  // 开发环境启用主进程热更新监听
  setupDevHotReload();

  createWindow();

  app.on("activate", () => {
    // 在macOS上，当点击dock图标且没有其他窗口打开时，通常需要在应用程序中重新创建一个窗口
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  // 在macOS上，用户通常希望应用在点X后继续运行，直到明确退出
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 提供加载新URL的方法
ipcMain.handle("load-url", async (_: any, url: string) => {
  if (mainWindow) {
    await mainWindow.loadURL(url);
    return { success: true };
  }
  return { success: false, error: "窗口未创建" };
});

// 提供获取应用信息的方法
ipcMain.handle("get-app-info", () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
  };
});

// 设置CSP安全策略
app.on("web-contents-created", (_, contents) => {
  // 开发环境中，关闭CSP校验
  if (isDev) {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // 删除任何现有的CSP头
          "Content-Security-Policy": [""],
        },
      });
    });
  } else {
    // 生产环境中设置严格的CSP
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self'; connect-src 'self' https://*; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';",
          ],
        },
      });
    });
  }
});
