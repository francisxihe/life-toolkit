import type { TraceEntry } from './types';
import {
  getLabPanelBridge,
  isLabFrameMessage,
  labFrameChannel,
  type LabFrameHandle,
  type LabFrameMessage,
} from './protocol';

function postToFrame(frame: HTMLIFrameElement, message: LabFrameMessage): void {
  frame.contentWindow?.postMessage(message, '*');
}

export function bindLabFrame(
  frame: HTMLIFrameElement,
  options: { setVisible: (visible: boolean) => void },
): LabFrameHandle {
  let destroyed = false;
  const pending = new Map<string, 'snapshot' | 'clear'>();

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
      options.setVisible(message.visible);
      api?.sendSetVisible(message.visible);
    }
  };

  const pushUpdate = (entries: TraceEntry[]) => {
    postToFrame(frame, { type: labFrameChannel.update, entries });
  };

  const api = getLabPanelBridge();
  const unsubUpdate = api?.onUpdate(pushUpdate);
  const onLoad = () => {
    void api?.snapshot().then((entries) => {
      if (entries) pushUpdate(entries);
    });
  };
  frame.addEventListener('load', onLoad);
  window.addEventListener('message', onMessage);

  return {
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      unsubUpdate?.();
      frame.removeEventListener('load', onLoad);
      window.removeEventListener('message', onMessage);
    },
  };
}
