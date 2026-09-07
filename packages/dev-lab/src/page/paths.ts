import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pageDir = path.dirname(fileURLToPath(import.meta.url));

export const labPageRoute = '/Lab.html';
export const labHtmlPath = path.join(pageDir, 'Lab.html');
export const labEntryPath = path.join(pageDir, 'Lab.tsx');
