import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { ROOT } from '../constants';
import { createLogger, readFileSafe, writeFileIfChanged, getVoPathFromDto } from '../utils';
import { parseDtoClasses } from './parsers/dto-parser';
import { generateVoContent } from './core/vo-generator';
import { extractImportsFromContent, removeImportsFromContent } from './generators/import-generator';

const SERVER_DTO_BASE = path.join(ROOT, 'packages/business/server/src');
const VO_BASE = path.join(ROOT, 'packages/business/vo');

const logLocal = createLogger('[dev-tools/dto-vo]');

/**
 * 主函数：同步 DTO 到 VO
 */
export function syncDtoToVo(options: { once?: boolean; watch?: boolean } = {}) {
  const { once = false, watch = false } = options;

  if (once) {
    logLocal('Run one-off sync (DTO → VO)');
    syncAll();
  } else if (watch) {
    logLocal('Start watching DTO files for changes...');
    startWatching();
  } else {
    // 默认执行一次性同步
    syncAll();
  }
}

/**
 * 同步所有 DTO 文件
 */
function syncAll() {
  const dtoFiles = fg.sync('**/dto/*.dto.ts', {
    cwd: SERVER_DTO_BASE,
    absolute: true,
  });

  logLocal(`Found ${dtoFiles.length} DTO files`);

  for (const dtoFile of dtoFiles) {
    syncOne(dtoFile);
  }
}

/**
 * 开始监听文件变化
 */
function startWatching() {
  const chokidar = require('chokidar');
  
  const watcher = chokidar.watch('**/dto/*.dto.ts', {
    cwd: SERVER_DTO_BASE,
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  });

  watcher
    .on('add', (filePath: string) => {
      const fullPath = path.join(SERVER_DTO_BASE, filePath);
      logLocal('File added:', filePath);
      syncOne(fullPath);
    })
    .on('change', (filePath: string) => {
      const fullPath = path.join(SERVER_DTO_BASE, filePath);
      logLocal('File changed:', filePath);
      syncOne(fullPath);
    })
    .on('unlink', (filePath: string) => {
      logLocal('File removed:', filePath);
      // TODO: 处理文件删除逻辑
    });

  logLocal('Watching for changes...');
}

/**
 * 更新 VO 目录的 index.ts 文件
 */
function updateVoIndex(voPath: string, exportNames: string[]) {
  const voDir = path.dirname(voPath);
  const indexPath = path.join(voDir, 'index.ts');
  
  let indexContent = '';
  if (fs.existsSync(indexPath)) {
    indexContent = readFileSafe(indexPath) || '';
  }
  
  // 生成新的导出语句
  const fileName = path.basename(voPath, '.ts');
  const newExport = `export * from './${fileName}';`;
  
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

/**
 * 同步单个 DTO 文件
 */
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
      const exportNames = dtoClasses.map(cls => cls.name.replace('Dto', 'Vo'));
      updateVoIndex(voPath, exportNames);
    }
    
  } catch (error) {
    logLocal('Error processing:', rel, (error as Error).message);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const args = process.argv.slice(2);
  const once = args.includes('--once');
  const watch = args.includes('--watch');
  
  syncDtoToVo({ once, watch });
}
