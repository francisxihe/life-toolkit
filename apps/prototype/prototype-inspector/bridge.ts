import {
  extractElementContext,
  generateCssSelector,
  init,
  type ElementContext,
  type ElementSelectorController,
} from 'fe-selector/core';
import { findProductReferenceTargetForElement } from '../src/product-wiki';
import { inspectorMessage, type InspectorSelection } from './protocol';

type BridgeHandle = { destroy: () => void };

export function bootstrapPrototypeInspectorBridge(): BridgeHandle {
  let selecting = false;
  let panelOpen = false;
  let selectionId = 0;
  const controller = init({ activationKey: 'alt' });

  const post = (message: unknown) => window.parent.postMessage(message, window.location.origin);

  const onMessage = (event: MessageEvent<unknown>) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    const message = event.data as { type?: string; payload?: { alwaysOn?: boolean; open?: boolean } } | null;
    if (message?.type === 'opt-ui:set-activation') selecting = Boolean(message.payload?.alwaysOn);
    if (message?.type === inspectorMessage.panel) panelOpen = Boolean(message.payload?.open);
  };

  const onClick = (event: MouseEvent) => {
    if (!selecting || !(event.target instanceof Element)) return;
    const id = ++selectionId;
    const productReferenceTarget = findProductReferenceTargetForElement(event.target);
    const selectedElement = productReferenceTarget?.element || event.target;
    const payload: InspectorSelection = {
      id,
      context: cloneContext(extractElementContext(selectedElement)),
      productRef: productReferenceTarget?.productReference.id,
    };
    post({ type: inspectorMessage.selection, payload });
    controller.clearSelected();

    void generateCssSelector(selectedElement).then((cssSelector) => {
      post({ type: inspectorMessage.selector, payload: { id, cssSelector } });
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || (!selecting && !isPanelOpen(panelOpen))) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    selecting = false;
    panelOpen = false;
    controller.deactivate();
    post({ type: inspectorMessage.cancel });
  };

  window.addEventListener('message', onMessage);
  document.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKeyDown, true);

  return {
    destroy: () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown, true);
      controller.destroy();
    },
  };
}

function isPanelOpen(panelOpen: boolean) {
  if (panelOpen) return true;
  try {
    return !window.parent.document.querySelector<HTMLElement>('.prototypeInspectorPanel')?.hidden;
  } catch {
    return false;
  }
}

function cloneContext(context: ElementContext): ElementContext {
  const seen = new WeakSet<object>();
  return JSON.parse(
    JSON.stringify(context, (_key, value) => {
      if (typeof value === 'symbol' || typeof value === 'bigint') return value.toString();
      if (value && typeof value === 'object') {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      return value;
    })
  ) as ElementContext;
}
