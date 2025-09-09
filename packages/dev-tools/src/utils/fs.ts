import fs from 'fs';

/**
 * 安全读取文件内容
 */
export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * 仅在内容变化时写入文件
 */
export function writeFileIfChanged(filePath: string, content: string): boolean {
  const existingContent = readFileSafe(filePath);

  // 文件不存在，直接写入
  if (existingContent === null) {
    // 确保目录存在
    const dir = require('path').dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  // 内容相同，跳过写入
  if (existingContent === content) {
    return false;
  }

  // 内容不同，写入文件
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

/**
 * 确保目录存在
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
