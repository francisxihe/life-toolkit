import { init, type ElementSelectorController } from 'fe-selector/core';
import { collectProductRefsFromElement, findProductRefHost } from './collect-refs';
import { type InspectorSelection, type ProductWikiInspectorBridge } from './protocol';

type BridgeHandle = { destroy: () => void };

const OVERLAY_STYLE_ID = 'product-wiki-inspector-overlay-style';
const ACTIVE_HIGHLIGHT_ID = 'product-wiki-active-highlight';

function inspectorApi(): ProductWikiInspectorBridge | undefined {
  return window.productWikiInspectorBridge;
}

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  const path = hash.split('?')[0] || window.location.pathname || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function ensureOverlayStyle() {
  if (document.getElementById(OVERLAY_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = OVERLAY_STYLE_ID;
  style.textContent = `
    [data-fe-selector-overlay],
    .fe-selector-overlay,
    .fe-selector-highlight,
    .product-wiki-active-highlight {
      position: fixed !important;
      pointer-events: none !important;
      box-sizing: border-box !important;
      margin: 0 !important;
    }
    .product-wiki-active-highlight {
      z-index: 2147483646;
      border: 2px solid var(--sue-color-primary, #1677ff);
      background: color-mix(in srgb, var(--sue-color-primary, #1677ff) 12%, transparent);
    }
  `;
  document.head.append(style);
}

function createActiveHighlight() {
  let target: Element | null = null;
  let box = document.getElementById(ACTIVE_HIGHLIGHT_ID) as HTMLDivElement | null;

  const paint = () => {
    if (!target || !document.contains(target)) {
      box?.remove();
      box = null;
      target = null;
      return;
    }
    if (!box) {
      box = document.createElement('div');
      box.id = ACTIVE_HIGHLIGHT_ID;
      box.className = 'product-wiki-active-highlight';
      box.setAttribute('aria-hidden', 'true');
      document.body.append(box);
    }
    const rect = target.getBoundingClientRect();
    box.style.top = `${rect.top}px`;
    box.style.left = `${rect.left}px`;
    box.style.width = `${Math.max(rect.width, 0)}px`;
    box.style.height = `${Math.max(rect.height, 0)}px`;
  };

  const clear = () => {
    target = null;
    box?.remove();
    box = null;
  };

  const show = (element: Element) => {
    target = findProductRefHost(element);
    paint();
  };

  window.addEventListener('scroll', paint, true);
  window.addEventListener('resize', paint);

  return {
    show,
    clear,
    get active() {
      return Boolean(target);
    },
    destroy: () => {
      window.removeEventListener('scroll', paint, true);
      window.removeEventListener('resize', paint);
      clear();
    },
  };
}

export function bootstrapProductInspectorBridge(): BridgeHandle {
  ensureOverlayStyle();
  const highlight = createActiveHighlight();
  let selecting = false;
  const controller: ElementSelectorController = init({
    activationKey: 'alt',
    silent: true,
  });

  const setSelecting = (next: boolean) => {
    selecting = next;
    if (next) controller.activate();
    else controller.deactivate();
  };

  const api = inspectorApi();
  const unsubscribeSelecting = api?.onSetSelecting(setSelecting);
  const unsubscribeCancel = api?.onCancel(() => {
    setSelecting(false);
    highlight.clear();
  });

  const onClick = (event: MouseEvent) => {
    if (!selecting || !(event.target instanceof Element)) return;
    event.preventDefault();
    event.stopPropagation();
    const payload: InspectorSelection = {
      productRefs: collectProductRefsFromElement(event.target),
      route: currentRoute(),
    };
    highlight.show(event.target);
    api?.sendSelection(payload);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || (!selecting && !highlight.active)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setSelecting(false);
    highlight.clear();
    api?.sendCancel();
  };

  document.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKeyDown, true);

  return {
    destroy: () => {
      unsubscribeSelecting?.();
      unsubscribeCancel?.();
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown, true);
      controller.destroy();
      highlight.destroy();
      document.getElementById(OVERLAY_STYLE_ID)?.remove();
    },
  };
}
