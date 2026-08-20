import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const FILE_NAME = 'ai-runtime-selection.json';

function selectionPath(): string {
  return path.join(app.getPath('userData'), FILE_NAME);
}

export function readSelectedRuntimeId(): string | null {
  try {
    const raw = fs.readFileSync(selectionPath(), 'utf8');
    const parsed = JSON.parse(raw) as { runtimeId?: unknown };
    return typeof parsed.runtimeId === 'string' && parsed.runtimeId.trim() ? parsed.runtimeId.trim() : null;
  } catch {
    return null;
  }
}

export function writeSelectedRuntimeId(runtimeId: string): string {
  const next = runtimeId.trim();
  fs.writeFileSync(selectionPath(), `${JSON.stringify({ runtimeId: next }, null, 2)}\n`, 'utf8');
  return next;
}
