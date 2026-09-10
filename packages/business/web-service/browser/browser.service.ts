import type { BrowserBoundsVo, BrowserNavigateRequestVo, BrowserStateVo, BrowserVisibleRequestVo } from '@true-north/vo';
import { BROWSER_STATE_CHANNEL } from '@true-north/vo';
import BrowserController from '../controller/browser';

type StateHandler = (state: BrowserStateVo) => void;

const stateListeners = new Set<StateHandler>();
let bridgeAttached = false;
let bridgeListener: ((...args: unknown[]) => void) | null = null;

function ensureStateBridge() {
  if (bridgeAttached) return;
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  if (!api?.on) return;
  bridgeListener = (_event: unknown, payload: BrowserStateVo) => {
    for (const handler of stateListeners) {
      try {
        handler(payload);
      } catch {
        // ignore handler errors
      }
    }
  };
  api.on(BROWSER_STATE_CHANNEL, bridgeListener);
  bridgeAttached = true;
}

export default class BrowserService {
  static getState() {
    return BrowserController.getState();
  }

  static setVisible(visible: boolean) {
    return BrowserController.setVisible({ visible } satisfies BrowserVisibleRequestVo);
  }

  static setBounds(bounds: BrowserBoundsVo) {
    return BrowserController.setBounds(bounds);
  }

  static createTab(url?: string) {
    return BrowserController.createTab(url);
  }

  static closeTab(id: string) {
    return BrowserController.closeTab(id);
  }

  static activateTab(id: string) {
    return BrowserController.activateTab(id);
  }

  static navigate(id: string, url: string) {
    return BrowserController.navigate(id, { tabId: id, url } satisfies BrowserNavigateRequestVo);
  }

  static goBack(id: string) {
    return BrowserController.goBack(id);
  }

  static goForward(id: string) {
    return BrowserController.goForward(id);
  }

  static reload(id: string) {
    return BrowserController.reload(id);
  }

  static extractTab(id: string) {
    return BrowserController.extractTab(id);
  }

  static subscribeState(handler: StateHandler): () => void {
    ensureStateBridge();
    stateListeners.add(handler);
    return () => {
      stateListeners.delete(handler);
    };
  }
}
