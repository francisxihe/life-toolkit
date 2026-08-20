import type { ChildProcess } from 'child_process';

const children = new Map<string, ChildProcess>();

export function registerChildProcess(streamId: string, child: ChildProcess): void {
  killChildProcess(streamId);
  children.set(streamId, child);
  const cleanup = () => {
    if (children.get(streamId) === child) children.delete(streamId);
  };
  child.once('exit', cleanup);
  child.once('error', cleanup);
}

export function killChildProcess(streamId: string): boolean {
  const child = children.get(streamId);
  if (!child) return false;
  children.delete(streamId);
  if (!child.killed) {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
  return true;
}
