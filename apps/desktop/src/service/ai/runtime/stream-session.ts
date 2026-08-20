import type { StreamSessionContext } from './types';

const sessions = new Map<string, StreamSessionContext>();

export function bindStreamSession(ctx: StreamSessionContext): void {
  sessions.set(ctx.streamId, ctx);
}

export function unbindStreamSession(streamId: string): void {
  sessions.delete(streamId);
}

export function getStreamSession(streamId: string): StreamSessionContext | undefined {
  return sessions.get(streamId);
}
