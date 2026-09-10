import type { TraceEntry } from './types';

export const labChannel = {
  snapshot: 'lab:snapshot',
  clear: 'lab:clear',
  update: 'lab:update',
  setVisible: 'lab:set-visible',
} as const;

export type LabTheme = 'light' | 'dark';

export const labFrameChannel = {
  snapshotRequest: 'lab:snapshot-request',
  snapshotResult: 'lab:snapshot-result',
  clearRequest: 'lab:clear-request',
  clearResult: 'lab:clear-result',
  update: 'lab:update',
  setVisible: 'lab:set-visible',
  setTheme: 'lab:set-theme',
  ready: 'lab:ready',
} as const;

export type LabPanelBridge = {
  snapshot: () => Promise<TraceEntry[]>;
  clear: () => Promise<TraceEntry[] | void>;
  sendSetVisible: (visible: boolean) => void;
  onUpdate: (listener: (entries: TraceEntry[]) => void) => () => void;
};

export type LabFrameMessage =
  | { type: typeof labFrameChannel.snapshotRequest; id: string }
  | { type: typeof labFrameChannel.snapshotResult; id: string; entries: TraceEntry[] }
  | { type: typeof labFrameChannel.clearRequest; id: string }
  | { type: typeof labFrameChannel.clearResult; id: string; entries: TraceEntry[] }
  | { type: typeof labFrameChannel.update; entries: TraceEntry[] }
  | { type: typeof labFrameChannel.setVisible; visible: boolean }
  | { type: typeof labFrameChannel.setTheme; theme: LabTheme }
  | { type: typeof labFrameChannel.ready };

export type LabFrameHandle = {
  destroy: () => void;
  setTheme: (theme: LabTheme) => void;
};

export function isLabTheme(value: unknown): value is LabTheme {
  return value === 'light' || value === 'dark';
}

declare global {
  interface Window {
    labPanel?: LabPanelBridge;
  }
}

export function isLabFrameMessage(value: unknown): value is LabFrameMessage {
  if (!value || typeof value !== 'object' || !('type' in value)) return false;
  const type = (value as { type: unknown }).type;
  switch (type) {
    case labFrameChannel.snapshotRequest:
    case labFrameChannel.clearRequest:
      return typeof (value as { id?: unknown }).id === 'string';
    case labFrameChannel.snapshotResult:
    case labFrameChannel.clearResult:
      return typeof (value as { id?: unknown }).id === 'string' && Array.isArray((value as { entries?: unknown }).entries);
    case labFrameChannel.update:
      return Array.isArray((value as { entries?: unknown }).entries);
    case labFrameChannel.setVisible:
      return typeof (value as { visible?: unknown }).visible === 'boolean';
    case labFrameChannel.setTheme:
      return isLabTheme((value as { theme?: unknown }).theme);
    case labFrameChannel.ready:
      return true;
    default:
      return false;
  }
}

function requestId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createParentLabBridge(): LabPanelBridge {
  const pending = new Map<string, (entries: TraceEntry[]) => void>();
  const listeners = new Set<(entries: TraceEntry[]) => void>();

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return;
    if (!isLabFrameMessage(event.data)) return;
    const message = event.data;
    if (message.type === labFrameChannel.snapshotResult || message.type === labFrameChannel.clearResult) {
      const resolve = pending.get(message.id);
      if (!resolve) return;
      pending.delete(message.id);
      resolve(message.entries);
      return;
    }
    if (message.type === labFrameChannel.update) {
      for (const listener of listeners) listener(message.entries);
    }
  });

  const request = (type: typeof labFrameChannel.snapshotRequest | typeof labFrameChannel.clearRequest) =>
    new Promise<TraceEntry[]>((resolve) => {
      const id = requestId();
      pending.set(id, resolve);
      window.parent.postMessage({ type, id } satisfies LabFrameMessage, '*');
    });

  return {
    snapshot: () => request(labFrameChannel.snapshotRequest),
    clear: () => request(labFrameChannel.clearRequest),
    sendSetVisible: (visible) => {
      window.parent.postMessage({ type: labFrameChannel.setVisible, visible } satisfies LabFrameMessage, '*');
    },
    onUpdate: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

let parentBridge: LabPanelBridge | undefined;

export function getLabPanelBridge(): LabPanelBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  if (window.labPanel) return window.labPanel;
  if (window.parent && window.parent !== window) {
    parentBridge ??= createParentLabBridge();
    return parentBridge;
  }
  return undefined;
}
