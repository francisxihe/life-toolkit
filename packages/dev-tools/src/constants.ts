import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从 packages/dev-tools/src/watch-controllers/constants.ts 回到项目根目录
export const ROOT = path.resolve(__dirname, '../../..');
export const SERVER_BASE = path.join(ROOT, 'packages/business/server/src');
export const DESKTOP_BASE = path.join(ROOT, 'apps/desktop/src/database');
