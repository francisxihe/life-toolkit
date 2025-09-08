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
import { ROOT, SERVER_BASE } from '../constants';
import {
  createLogger,
  readFileSafe,
  writeFileIfChanged,
  getRelServerPath,
  getDesktopControllerPathFromServer,
  getApiControllerPathFromServer,
  typeToServiceConstName,
} from '../utils';
import { parseClassName, parseConstructorServiceTypes } from './parser';
import { syncMissingMethods, ensureConstructorArgs } from './sync/sync-database';
import { syncApiMethods } from './sync/sync-api';

const logLocal = createLogger('watch-controllers');



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
