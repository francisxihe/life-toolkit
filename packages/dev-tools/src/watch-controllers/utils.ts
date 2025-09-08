import fs from 'fs';
import path from 'path';
import { DESKTOP_BASE, SERVER_BASE } from '../constants';

export function log(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log('[dev-tools/watch-controllers]', ...args);
}

export function readFileSafe(p: string): string | null {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

export function writeFileIfChanged(p: string, content: string): boolean {
  const prev = readFileSafe(p);
  if (prev === null) return false;
  if (prev === content) return false;
  fs.writeFileSync(p, content, 'utf8');
  return true;
}

export function getRelServerPath(abs: string) {
  return path.relative(SERVER_BASE, abs);
}

export function getDesktopControllerPathFromServer(absServerPath: string) {
  const rel = getRelServerPath(absServerPath);
  return path.join(DESKTOP_BASE, rel);
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
