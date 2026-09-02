import { installHostDock } from '@ylib/product-dock';
import type { TraceEntry } from './types';
import {
  getLabPanelBridge,
  isLabFrameMessage,
  labFrameChannel,
  type LabDockHandle,
  type LabFrameMessage,
} from './protocol';

const WIKI_FRAME_ID = 'product-wiki-dock-frame';

const LAB_DOCK_IDS = {
  style: 'lab-dock-style',
  root: 'lab-dock',
  frame: 'lab-dock-frame',
  handle: 'lab-dock-handle',
  capture: 'lab-dock-capture',
} as const;

function postToFrame(frame: HTMLIFrameElement, message: LabFrameMessage): void {
  frame.contentWindow?.postMessage(message, '*');
}

function wikiDockFrame(): HTMLIFrameElement | null {
  return document.getElementById(WIKI_FRAME_ID) as HTMLIFrameElement | null;
}

function wikiDockVisible(): boolean {
  const frame = wikiDockFrame();
  if (!frame) return false;
  if (frame.style.display === 'none') return false;
  const width = frame.style.width;
  return Boolean(width && width !== '0px');
}

function restoreWikiPaddingIfNeeded(): void {
  if (!wikiDockVisible()) return;
  const width = wikiDockFrame()?.style.width;
  if (width) document.body.style.paddingRight = width;
}

export function installLabDock(options: { src?: string } = {}): LabDockHandle {
  document.getElementById(LAB_DOCK_IDS.capture)?.remove();
  const dock = installHostDock({
    src: options.src ?? '/Lab.html',
    frameTitle: 'Lab',
    ids: LAB_DOCK_IDS,
    minWidth: 320,
    defaultWidth: 420,
  });

  let destroyed = false;
  const pending = new Map<string, 'snapshot' | 'clear'>();
  const frame = dock.frame;

  const setVisible = (next: boolean) => {
    window.__labDockPreferred = next;
    dock.setVisible(next);
    if (!next) restoreWikiPaddingIfNeeded();
  };

  const reply = (id: string, entries: TraceEntry[]) => {
    const kind = pending.get(id);
    pending.delete(id);
    if (kind === 'clear') {
      postToFrame(frame, { type: labFrameChannel.clearResult, id, entries });
      return;
    }
    postToFrame(frame, { type: labFrameChannel.snapshotResult, id, entries });
  };

  const onMessage = (event: MessageEvent) => {
    if (event.source !== frame.contentWindow) return;
    if (!isLabFrameMessage(event.data)) return;
    const api = getLabPanelBridge();
    const message = event.data;
    if (message.type === labFrameChannel.snapshotRequest) {
      pending.set(message.id, 'snapshot');
      void Promise.resolve(api?.snapshot())
        .then((entries) => reply(message.id, Array.isArray(entries) ? entries : []))
        .catch(() => reply(message.id, []));
      return;
    }
    if (message.type === labFrameChannel.clearRequest) {
      pending.set(message.id, 'clear');
      void Promise.resolve(api?.clear())
        .then((entries) => reply(message.id, Array.isArray(entries) ? entries : []))
        .catch(() => reply(message.id, []));
      return;
    }
    if (message.type === labFrameChannel.setVisible) {
      setVisible(message.visible);
      api?.sendSetVisible(message.visible);
    }
  };

  const pushUpdate = (entries: TraceEntry[]) => {
    postToFrame(frame, { type: labFrameChannel.update, entries });
  };

  const api = getLabPanelBridge();
  const unsubUpdate = api?.onUpdate(pushUpdate);
  frame.addEventListener('load', () => {
    void api?.snapshot().then((entries) => {
      if (entries) pushUpdate(entries);
    });
  });
  window.addEventListener('message', onMessage);

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    unsubUpdate?.();
    window.removeEventListener('message', onMessage);
    const keepWiki = wikiDockVisible();
    dock.destroy();
    if (keepWiki) restoreWikiPaddingIfNeeded();
    if (window.__labDock === handleApi) delete window.__labDock;
  };

  const handleApi: LabDockHandle = { setVisible, destroy };
  window.__labDock = handleApi;
  if (window.__labDockPreferred) setVisible(true);
  else setVisible(false);

  return handleApi;
}
