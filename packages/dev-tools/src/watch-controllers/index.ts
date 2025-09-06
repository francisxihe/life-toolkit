/*
  Dev tool (TS): Watch business server controllers and sync desktop + API controllers.
  - Desktop: sync constructor args and missing methods
  - API: sync missing methods with proper method names

  Usage:
    pnpm -F @life-toolkit/dev-tools run sync:controllers   # one-off
    pnpm -F @life-toolkit/dev-tools run watch:controllers  # watch
*/

import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import fg from 'fast-glob';
import { ROOT, SERVER_BASE, DESKTOP_BASE } from './constants';
import {
  log as _log,
  readFileSafe,
  writeFileIfChanged,
  getRelServerPath,
  getDesktopControllerPathFromServer,
} from './utils';
import { parseClassName, parseConstructorServiceTypes } from './parser';
import { syncMissingMethods, ensureConstructorArgs } from './sync/sync-database';
import { syncApiMethods } from './sync/sync-api';

function logLocal(...args: any[]) {
  // eslint-disable-next-line no-console
  _log(...args);
}

function typeToServiceConstName(type: string): string {
  if (type.endsWith('Service')) {
    const base = type.slice(0, -7); // remove "Service"
    return base.charAt(0).toLowerCase() + base.slice(1) + 'Service';
  }
  return type.charAt(0).toLowerCase() + type.slice(1);
}

// 获取 API controller 路径
function getApiControllerPathFromServer(serverControllerPath: string): string {
  // 从 packages/business/server/src/growth/task/task.controller.ts
  // 转换为 packages/business/api/controller/task/task.ts
  const relativePath = path.relative(path.join(ROOT, 'packages/business/server/src'), serverControllerPath);
  const parts = relativePath.split(path.sep);

  // 移除最后的 .controller.ts 并替换为 .ts
  const fileName = parts[parts.length - 1].replace('.controller.ts', '.ts');

  return path.join(ROOT, 'packages/business/api/controller', fileName);
}

function syncOne(serverControllerPath: string) {
  const rel = getRelServerPath(serverControllerPath);
  if (!rel.endsWith('.controller.ts')) return;

  const serverContent = readFileSafe(serverControllerPath);
  if (!serverContent) return;

  const className = parseClassName(serverContent);
  if (!className) {
    logLocal('Skip (no class found):', rel);
    return;
  }

  const serviceTypes = parseConstructorServiceTypes(serverContent);
  const serviceConstNames = serviceTypes.map(typeToServiceConstName);

  // 同步 Desktop Controller
  const desktopPath = getDesktopControllerPathFromServer(serverControllerPath);
  if (fs.existsSync(desktopPath)) {
    const desktopContent = readFileSafe(desktopPath);
    if (desktopContent) {
      let next = desktopContent;
      // Always update constructor args, even when empty
      next = ensureConstructorArgs(next, className, serviceConstNames);
      // Append any missing methods at class end (no import changes)
      next = syncMissingMethods(next, className, serverContent);

      if (next !== desktopContent) {
        const ok = writeFileIfChanged(desktopPath, next);
        if (ok) logLocal('Synced desktop controller ->', path.relative(ROOT, desktopPath));
      }
    }
  } else {
    logLocal('Desktop controller not found:', path.relative(ROOT, desktopPath));
  }

  // 同步 API Controller
  const apiPath = getApiControllerPathFromServer(serverControllerPath);
  if (fs.existsSync(apiPath)) {
    const apiContent = readFileSafe(apiPath);
    if (apiContent) {
      const next = syncApiMethods(apiContent, className, serverContent, className);
      if (next !== apiContent) {
        const ok = writeFileIfChanged(apiPath, next);
        if (ok) logLocal('Synced API controller ->', path.relative(ROOT, apiPath));
      }
    }
  } else {
    logLocal('API controller not found:', path.relative(ROOT, apiPath));
  }
}

function syncAllOnce() {
  const serverControllerPaths = fg.sync(path.join(SERVER_BASE, '**/*.controller.ts').replace(/\\/g, '/'));
  for (const p of serverControllerPaths) {
    syncOne(p);
  }
}

function watchAndSync() {
  const serverControllerGlob = path.join(SERVER_BASE, '**/*.controller.ts');
  logLocal('[dev-tools/watch-controllers] Watching:', serverControllerGlob);

  const watcher = chokidar.watch(serverControllerGlob, {
    ignoreInitial: false,
    persistent: true,
  });

  watcher.on('add', syncOne);
  watcher.on('change', syncOne);

  watcher.on('ready', () => {
    logLocal('[dev-tools/watch-controllers] Initial scan complete. Watching for changes...');
  });

  return watcher;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--once')) {
    logLocal('[dev-tools/watch-controllers] Run one-off sync (desktop + API controllers)');
    syncAllOnce();
  } else {
    watchAndSync();
  }
}

export { syncOne, syncAllOnce, watchAndSync };
