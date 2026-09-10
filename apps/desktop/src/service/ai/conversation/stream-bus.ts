import { BrowserWindow } from 'electron';
import type { AiChatStreamEventVo } from '@true-north/vo';
import { AI_CONVERSATION_STREAM_CHANNEL } from '@true-north/vo';

const controllers = new Map<string, AbortController>();

export function registerStreamAbort(streamId: string): AbortSignal {
  cancelStream(streamId);
  const controller = new AbortController();
  controllers.set(streamId, controller);
  return controller.signal;
}

export function cancelStream(streamId: string): boolean {
  const existing = controllers.get(streamId);
  if (!existing) return false;
  existing.abort();
  controllers.delete(streamId);
  return true;
}

export function finishStream(streamId: string): void {
  controllers.delete(streamId);
}

export function emitStream(event: AiChatStreamEventVo): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(AI_CONVERSATION_STREAM_CHANNEL, event);
    }
  }
}
