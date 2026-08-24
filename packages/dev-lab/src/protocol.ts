import type { TraceEntry } from './types';

export const labChannel = {
  snapshot: 'lab:snapshot',
  clear: 'lab:clear',
  update: 'lab:update',
  setVisible: 'lab:set-visible',
} as const;

export type LabPanelBridge = {
  snapshot: () => Promise<TraceEntry[]>;
  clear: () => Promise<TraceEntry[] | void>;
  sendSetVisible: (visible: boolean) => void;
  onUpdate: (listener: (entries: TraceEntry[]) => void) => () => void;
};

declare global {
  interface Window {
    labPanel?: LabPanelBridge;
  }
}

export {};
