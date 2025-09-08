/*
  Dev tool (TS): Watch business server DTOs and sync VO types.
  - 监听 DTO 文件变化，自动生成对应的 VO 类型定义
  - 支持 model.dto.ts, form.dto.ts, filter.dto.ts 三种类型

  Usage:
    pnpm -F @life-toolkit/dev-tools run sync:dto     # one-off
    pnpm -F @life-toolkit/dev-tools run watch:dto    # watch
*/

import path from 'path';
import fs from 'fs';
import fg from 'fast-glob';
import chokidar from 'chokidar';
import { ROOT } from '../constants';
import { createLogger, readFileSafe, writeFileIfChanged, getVoPathFromDto } from '../utils';
import { parseDtoClasses } from './parsers/dto-parser';
import { generateVoContent } from './core/vo-generator';
// 使用本地定义的函数，避免导入冲突

const SERVER_DTO_BASE = path.join(ROOT, 'packages/business/server/src');
const VO_BASE = path.join(ROOT, 'packages/business/vo');

const logLocal = createLogger('dto-vo');

// 提取文件中的 import 语句
function extractImportsFromContent(content: string): string | null {
  const lines = content.split('\n');
  const importLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ')) {
      importLines.push(line);
    } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
      // 遇到非 import 非注释的内容就停止
      break;
    }
  }

  return importLines.length > 0 ? importLines.join('\n') : null;
}

// 移除文件中的 import 语句
function removeImportsFromContent(content: string): string {
  const lines = content.split('\n');
  const nonImportLines: string[] = [];
  let foundNonImport = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ')) {
      // 跳过 import 行
      continue;
    } else if (trimmed || foundNonImport) {
      // 保留非 import 行
      nonImportLines.push(line);
      if (trimmed) foundNonImport = true;
    }
  }

  return nonImportLines.join('\n').trim();
}

// 获取模块的 index.ts 路径
function getVoIndexPath(voFilePath: string): string {
  return path.join(path.dirname(voFilePath), 'index.ts');
}

// 更新 index.ts 导出
function updateVoIndex(voFilePath: string, exportNames: string[]) {
  const indexPath = getVoIndexPath(voFilePath);
  const fileName = path.basename(voFilePath, '.vo.ts');

  let indexContent = '';
  if (fs.existsSync(indexPath)) {
    indexContent = readFileSafe(indexPath) || '';
  }

  // 生成新的导出语句
  const newExport = `export * from './${fileName}.vo';`;

  // 检查是否已存在该导出
  if (!indexContent.includes(newExport)) {
    indexContent = indexContent.trim();
    if (indexContent) {
      indexContent += '\n';
    }
    indexContent += newExport + '\n';

    // 确保目录存在
    const dir = path.dirname(indexPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    writeFileIfChanged(indexPath, indexContent);
    logLocal('Updated index:', path.relative(ROOT, indexPath));
  }
}

function syncOne(dtoFilePath: string) {
  const rel = path.relative(SERVER_DTO_BASE, dtoFilePath);
  if (!rel.includes('/dto/') || !rel.endsWith('.dto.ts')) return;

  const dtoContent = readFileSafe(dtoFilePath);
  if (!dtoContent) return;

  try {
    const dtoClasses = parseDtoClasses(dtoContent, dtoFilePath);
    if (dtoClasses.length === 0) {
      logLocal('Skip (no DTO classes found):', rel);
      return;
    }

    const voContent = generateVoContent(dtoClasses, dtoFilePath);
    const voPath = getVoPathFromDto(dtoFilePath);

    // 确保目录存在
    const voDir = path.dirname(voPath);
    if (!fs.existsSync(voDir)) {
      fs.mkdirSync(voDir, { recursive: true });
    }

    // 检查文件是否存在，如果存在则保留用户的 import
    let finalContent = voContent;
    if (fs.existsSync(voPath)) {
      const existingContent = readFileSafe(voPath) || '';
      const existingImports = extractImportsFromContent(existingContent);

      if (existingImports) {
        // 移除生成内容中的 import，使用现有的 import
        const contentWithoutImports = removeImportsFromContent(voContent);
        finalContent = existingImports + '\n\n' + contentWithoutImports;
      }
    }

    // 写入 VO 文件
    const changed = writeFileIfChanged(voPath, finalContent);
    if (changed) {
      logLocal('Generated VO:', path.relative(ROOT, voPath));

      // 更新 index.ts
      const exportNames = dtoClasses.map((cls) => cls.name.replace('Dto', 'Vo'));
      updateVoIndex(voPath, exportNames);
    }
  } catch (error) {
    logLocal('Error processing:', rel, (error as Error).message);
  }
}

function syncAllOnce() {
  const dtoPaths = fg.sync(path.join(SERVER_DTO_BASE, '**/dto/*.dto.ts').replace(/\\/g, '/'));
  logLocal(`Found ${dtoPaths.length} DTO files`);

  for (const p of dtoPaths) {
    syncOne(p);
  }
}

function watchAndSync() {
  const dtoGlob = path.join(SERVER_DTO_BASE, '**/dto/*.dto.ts');
  logLocal('Watching:', dtoGlob);

  const watcher = chokidar.watch(dtoGlob, {
    ignoreInitial: false,
    persistent: true,
  });

  watcher.on('add', syncOne);
  watcher.on('change', syncOne);

  watcher.on('ready', () => {
    logLocal('Initial scan complete. Watching for changes...');
  });

  return watcher;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--once')) {
    logLocal('Run one-off sync (DTO → VO)');
    syncAllOnce();
  } else {
    watchAndSync();
  }
}

export { syncOne, syncAllOnce, watchAndSync };
