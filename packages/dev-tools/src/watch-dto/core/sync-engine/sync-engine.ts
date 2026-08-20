/**
 * VO 同步引擎基类
 */

import { IntermediateState } from '../intermediate-state/types';
import { DiffResult } from '../diff-engine';
import fs from 'fs';
import path from 'path';
import { getVoPathFromDto } from '../../../utils/path';

/**
 * 同步引擎基类
 */
export abstract class SyncEngine {
  /**
   * 生成 VO 内容
   */
  abstract generateVoContent(intermediateState: IntermediateState): string;

  /**
   * 同步到文件
   */
  syncToFile(voPath: string, content: string): boolean {
    // 确保目录存在
    const dir = path.dirname(voPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 检查文件是否存在以及内容是否变化
    if (fs.existsSync(voPath)) {
      const existingContent = fs.readFileSync(voPath, 'utf-8');
      if (existingContent === content) {
        return false; // 内容未变化
      }
    }

    // 写入文件
    fs.writeFileSync(voPath, content, 'utf-8');
    return true; // 文件已更新
  }

  /**
   * 获取 VO 文件路径
   */
  getVoPath(dtoFilePath: string): string {
    return getVoPathFromDto(dtoFilePath);
  }

  /**
   * 保留用户自定义的导入
   */
  preserveUserImports(existingContent: string, generatedContent: string): string {
    const existingImports = this.extractImports(existingContent);
    const generatedImports = this.extractImports(generatedContent);
    const generatedWithoutImports = this.removeImports(generatedContent);

    if (existingImports) {
      const mergedImports = this.mergeImports(existingImports, generatedImports);
      return `${mergedImports}\n\n${generatedWithoutImports}`;
    }

    return generatedContent;
  }

  /**
   * 提取导入语句
   */
  private extractImports(content: string): string | null {
    const lines = content.split('\n');
    const importLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ')) {
        importLines.push(line);
      } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        break;
      }
    }

    return importLines.length > 0 ? importLines.join('\n') : null;
  }

  /**
   * 移除导入语句
   */
  private removeImports(content: string): string {
    const lines = content.split('\n');
    const nonImportLines: string[] = [];
    let foundNonImport = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ')) {
        continue;
      } else if (trimmed || foundNonImport) {
        nonImportLines.push(line);
        if (trimmed) foundNonImport = true;
      }
    }

    return nonImportLines.join('\n').trim();
  }

  private mergeImports(existingImports: string, generatedImports: string | null): string {
    const grouped = new Map<string, Set<string>>();
    const passthrough: string[] = [];
    for (const line of `${existingImports}\n${generatedImports || ''}`.split('\n')) {
      const match = line.match(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+['\"]([^'\"]+)['\"];?$/);
      if (!match) {
        if (line && !passthrough.includes(line)) passthrough.push(line);
        continue;
      }
      const names = grouped.get(match[2]) || new Set<string>();
      match[1].split(',').map((name) => name.trim()).filter(Boolean).forEach((name) => names.add(name));
      grouped.set(match[2], names);
    }
    return [
      ...passthrough,
      ...[...grouped.entries()].map(([source, names]) => `import { ${[...names].join(', ')} } from '${source}';`),
    ].join('\n');
  }
}
