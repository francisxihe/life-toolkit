import express from 'express';
import path from 'path';
import { createApiSyncEngine } from '../watch-controller/target-api/sync-engine';
import { createWebServiceSyncEngine } from '../watch-controller/target-web-service/sync-engine';
import {
  CONTROLLER_SOURCE_PATH,
  AI_CONTROLLER_SOURCE_PATH,
  CONTROLLER_API_TARGET_PATH,
  CONTROLLER_WEB_SERVICE_TARGET_PATH,
} from '../constants';
import { existsSync } from 'fs';

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'dist')));

/** growth 模块列表（相对 CONTROLLER_SOURCE_PATH = .../service/growth） */
const GROWTH_CONTROLLERS = [
  { name: 'todo', path: 'todo', module: 'growth' as const },
  { name: 'goal', path: 'goal', module: 'growth' as const },
  { name: 'habit', path: 'habit', module: 'growth' as const },
  { name: 'task', path: 'task', module: 'growth' as const },
  { name: 'track-time', path: 'track-time', module: 'growth' as const },
];

/** AI 模块（源根为 service/ai） */
const AI_CONTROLLERS = [{ name: 'ai', path: '', module: 'ai' as const }];

const ALL_CONTROLLERS = [...GROWTH_CONTROLLERS, ...AI_CONTROLLERS];

// 辅助函数：生成控制器类名
function generateControllerClassName(name: string): string {
  return (
    name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Controller'
  );
}

function routeControllerPath(module: 'growth' | 'ai', modulePath: string, name: string) {
  const root = module === 'ai' ? AI_CONTROLLER_SOURCE_PATH : CONTROLLER_SOURCE_PATH;
  return modulePath
    ? path.join(root, modulePath, `${name}.route-controller.ts`)
    : path.join(root, `${name}.route-controller.ts`);
}

// 辅助函数：查找 API 控制器对
function findApiControllerPairs() {
  const pairs = [];

  for (const controller of ALL_CONTROLLERS) {
    const className = generateControllerClassName(controller.name);
    const sourcePath = routeControllerPath(controller.module, controller.path, controller.name);
    const targetPath = path.join(CONTROLLER_API_TARGET_PATH, `${controller.name}.ts`);

    if (existsSync(sourcePath) && existsSync(targetPath)) {
      pairs.push({
        className,
        name: controller.name,
        sourcePath,
        targetPath,
      });
    }
  }

  return pairs;
}

// 辅助函数：查找 Web Service 控制器对
function findWebServiceControllerPairs() {
  const pairs = [];

  for (const controller of ALL_CONTROLLERS) {
    const className = generateControllerClassName(controller.name).replace('Controller', 'Service');
    const sourcePath = routeControllerPath(controller.module, controller.path, controller.name);
    const targetPath = path.join(
      CONTROLLER_WEB_SERVICE_TARGET_PATH,
      controller.module,
      `${controller.name}.service.ts`
    );

    if (existsSync(sourcePath) && existsSync(targetPath)) {
      pairs.push({
        className,
        name: controller.name,
        sourcePath,
        targetPath,
      });
    }
  }

  return pairs;
}

// 辅助函数：查找单个 API 控制器对
function findApiControllerPair(name: string) {
  const pairs = findApiControllerPairs();
  return (
    pairs.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() || p.className.toLowerCase().includes(name.toLowerCase())
    ) || null
  );
}

// 辅助函数：查找单个 Web Service 控制器对
function findWebServiceControllerPair(name: string) {
  const pairs = findWebServiceControllerPairs();
  return (
    pairs.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() || p.className.toLowerCase().includes(name.toLowerCase())
    ) || null
  );
}

// Desktop Proxy 层已合并进 route-controller，相关同步下线
app.get('/api/check/method-details', async (_req, res) => {
  res.json({
    success: true,
    data: {
      controllers: [],
      lastChecked: new Date().toISOString(),
      retired: true,
      message:
        'Desktop Proxy Controller 已下线：*.route-controller.ts 直接注册 IPC，不再生成 *.controller.ts 透传层。',
    },
  });
});

app.post('/api/sync/desktop-controller', async (_req, res) => {
  res.json({
    success: false,
    error:
      'Desktop Proxy Controller 同步已下线。请直接维护 *.route-controller.ts，并用 API / Web Service 同步生成客户端。',
  });
});

// ========== API 控制器 API 端点 ==========
app.post('/api/sync/api-controller', async (req, res) => {
  const { name, dryRun = false } = req.body;
  const engine = createApiSyncEngine();

  try {
    if (!name) {
      res.json({ success: false, error: '缺少 name 参数' });
      return;
    }

    const pair = findApiControllerPair(name);
    if (!pair) {
      res.json({ success: false, error: `未找到 API 控制器: ${name}` });
      return;
    }

    const result = await engine.syncController(pair.sourcePath, pair.targetPath, {
      dryRun,
      verbose: true,
    });

    res.json({
      success: result.success,
      data: {
        name: pair.name,
        className: pair.className,
        needsSync: result.diff.needsSync,
        changeCount: result.diff.changes.length,
        actionCount: result.actions.length,
        dryRun,
        changes: result.diff.changes.map((change) => ({
          type: change.changeType,
          description: change.description,
        })),
        actions: result.actions.map((action) => ({
          type: action.type,
          methodName: action.methodName,
          description: action.description,
        })),
      },
      message: result.success
        ? dryRun
          ? `API 控制器 ${pair.className} 检查完成`
          : `API 控制器 ${pair.className} 同步完成`
        : `API 控制器 ${pair.className} 同步失败`,
      error: result.error,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// 获取 API 控制器方法级别详情
app.get('/api/check/api-method-details', async (req, res) => {
  try {
    const engine = createApiSyncEngine();

    const results = await engine.checkAllDiffResults();

    res.json({
      success: true,
      data: {
        controllers: results,
        lastChecked: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('API 控制器方法详情检查失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ========== Web Service API 端点 ==========

app.get('/api/check/web-service-method-details', async (req, res) => {
  try {
    const engine = createWebServiceSyncEngine();

    const results = await engine.checkAllDiffResults();

    res.json({
      success: true,
      data: {
        controllers: results,
        lastChecked: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Web Service 方法详情检查失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/api/sync/web-service-controller', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({
      success: false,
      error: '缺少控制器名称参数',
    });
    return;
  }

  try {
    const pair = findWebServiceControllerPair(name);
    if (!pair) {
      res.status(404).json({
        success: false,
        error: `未找到 Web Service: ${name}`,
      });
      return;
    }

    const engine = createWebServiceSyncEngine();
    const result = await engine.syncController(pair.sourcePath, pair.targetPath, {
      dryRun: false,
      verbose: true,
    });

    if (result.success) {
      res.json({
        success: true,
        message: `Web Service ${pair.className} 同步完成`,
        data: {
          controllerName: result.controllerName,
          needsSync: result.diff.needsSync,
          changeCount: result.diff.changes.length,
          actionCount: result.actions.length,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Web Service 同步失败',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// 处理 SPA 路由
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Dev Tools 服务器运行在 http://localhost:${port}`);
});
