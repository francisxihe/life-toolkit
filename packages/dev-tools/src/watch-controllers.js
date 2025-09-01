/*
  Dev tool: Watch business server controllers and sync desktop controllers' service imports and constructor args.
  Usage:
    pnpm --filter @life-toolkit/dev-tools run watch:controllers
    pnpm --filter @life-toolkit/dev-tools run sync:controllers  # one-off sync
*/

const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const ROOT = path.resolve(__dirname, '../../..');
const SERVER_BASE = path.join(ROOT, 'packages/business/server/src');
const DESKTOP_BASE = path.join(ROOT, 'apps/desktop/src/database');

function log(...args) {
  console.log('[dev-tools/watch-controllers]', ...args);
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return null;
  }
}

function writeFileIfChanged(p, content) {
  const prev = readFileSafe(p);
  if (prev === null) return false;
  if (prev === content) return false;
  fs.writeFileSync(p, content, 'utf8');
  return true;
}

function getRelServerPath(abs) {
  return path.relative(SERVER_BASE, abs);
}

function getDesktopControllerPathFromServer(absServerPath) {
  // Keep module subpath, only swap base dir
  const rel = getRelServerPath(absServerPath);
  const target = path.join(DESKTOP_BASE, rel);
  return target;
}

function parseClassName(serverContent) {
  const m = serverContent.match(/export\s+class\s+(\w+)\s*\{/);
  return m ? m[1] : null;
}

function parseConstructorServiceTypes(serverContent) {
  const ctorMatch = serverContent.match(/constructor\s*\(([^)]*)\)\s*\{/s);
  if (!ctorMatch) return [];
  const params = ctorMatch[1];
  const types = [];
  // Match ": TypeName" occurrences
  const regex = /:\s*([A-Za-z_][A-Za-z0-9_]*)/g;
  let m;
  while ((m = regex.exec(params)) !== null) {
    types.push(m[1]);
  }
  return types;
}

function typeToServiceConstName(typeName) {
  // e.g. TodoService -> todoService; TodoRepeatService -> todoRepeatService
  if (!typeName) return '';
  return typeName.charAt(0).toLowerCase() + typeName.slice(1);
}

function ensureImportServices(content, moduleName, serviceConstNames) {
  const expected = `import { ${serviceConstNames.join(', ')} } from "./${moduleName}.service";`;
  const importRe = new RegExp(
    `import\\s*{[\\s\\S]*?}\\s*from\\s*["']\\./${moduleName}\\.service["'];?`
  );
  if (importRe.test(content)) {
    return content.replace(importRe, expected);
  }
  // If not found, insert after business-server controller import line
  const anchorRe = new RegExp(
    `(^.*import\\s*{\\s*${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller\\s+as\\s+_[^}]+}\\s*from\\s*["']@life-toolkit/business-server["'];?\\s*$)`,
    'm'
  );
  if (anchorRe.test(content)) {
    return content.replace(anchorRe, `$1\n${expected}`);
  }
  // Fallback: prepend at top (after first import)
  return content.replace(/(^import[\s\S]*?;\s*)/, `$1\n${expected}\n`);
}

function ensureConstructorArgs(content, className, serviceConstNames) {
  const baseName = className.replace(/Controller$/, '');
  const callRe = new RegExp(
    `new\\s+_${baseName}Controller\\s*\\(([^)]*)\\)`,
    'm'
  );
  if (!callRe.test(content)) return content;
  return content.replace(callRe, `new _${baseName}Controller(${serviceConstNames.join(', ')})`);
}

function syncOne(serverControllerPath) {
  const rel = getRelServerPath(serverControllerPath);
  if (!rel.endsWith('.controller.ts')) return;
  const serverContent = readFileSafe(serverControllerPath);
  if (!serverContent) return;

  const className = parseClassName(serverContent);
  if (!className) {
    log('Skip (no class found):', rel);
    return;
  }
  const serviceTypes = parseConstructorServiceTypes(serverContent);
  const serviceConstNames = serviceTypes.map(typeToServiceConstName);

  const desktopPath = getDesktopControllerPathFromServer(serverControllerPath);
  if (!fs.existsSync(desktopPath)) {
    log('Desktop controller not found, skip:', path.relative(ROOT, desktopPath));
    return;
  }
  const desktopContent = readFileSafe(desktopPath);
  if (!desktopContent) return;

  // Compute module name from folder, e.g., growth/todo -> todo
  const moduleName = path.basename(path.dirname(desktopPath));

  let next = desktopContent;
  if (serviceConstNames.length > 0) {
    next = ensureImportServices(next, moduleName, serviceConstNames);
    next = ensureConstructorArgs(next, className, serviceConstNames);
  }

  if (next !== desktopContent) {
    const ok = writeFileIfChanged(desktopPath, next);
    if (ok) log('Synced:', moduleName, '->', path.relative(ROOT, desktopPath));
  } else {
    // log('No changes for:', path.relative(ROOT, desktopPath));
  }
}

function syncAllOnce() {
  const fg = require('fast-glob');
  const cwd = SERVER_BASE;
  const entries = fg.sync('**/*.controller.ts', { cwd, onlyFiles: true });
  entries.forEach((rel) => {
    const abs = path.join(cwd, rel);
    syncOne(abs);
  });
}

function main() {
  const once = process.argv.includes('--once');
  if (once) {
    log('Run one-off sync');
    syncAllOnce();
    return;
  }
  log('Watching controllers...');
  const watcher = chokidar.watch(path.join(SERVER_BASE, '**/*.controller.ts'), {
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
  });
  watcher.on('add', syncOne).on('change', syncOne);
}

main();
