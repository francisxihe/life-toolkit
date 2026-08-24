import { init, type ElementSelectorController } from 'fe-selector/core';
import { collectProductRefsFromElement, findProductRefHost } from './collect-refs';
import { parseProductRefAttribute } from '../product-ref-attr';
import type { ProductRef } from '../reference';
import {
  type InspectorPageContext,
  type InspectorSelection,
  type ProductWikiInspectorBridge,
} from './protocol';

type BridgeHandle = { destroy: () => void };

const OVERLAY_STYLE_ID = 'product-wiki-inspector-overlay-style';
const ACTIVE_HIGHLIGHT_ID = 'product-wiki-active-highlight';
const SELECTOR_OVERLAY_SELECTOR =
  '[data-fe-selector-overlay], .fe-selector-overlay, .fe-selector-highlight';
const PAGE_CONTEXT_DELAY_MS = 50;

function inspectorApi(): ProductWikiInspectorBridge | undefined {
  return window.productWikiInspectorBridge;
}

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  const path = hash.split('?')[0] || window.location.pathname || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function collectVisibleProductRefs(): ProductRef[] {
  const refs: ProductRef[] = [];
  const seen = new Set<string>();
  document.querySelectorAll('[data-product-ref]').forEach((element) => {
    for (const reference of parseProductRefAttribute(element.getAttribute('data-product-ref'))) {
      if (seen.has(reference)) continue;
      seen.add(reference);
      refs.push(reference);
    }
  });
  return refs;
}

function removeSelectorOverlays() {
  document.querySelectorAll(SELECTOR_OVERLAY_SELECTOR).forEach((element) => element.remove());
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
  let visible = false;
  let box = document.getElementById(ACTIVE_HIGHLIGHT_ID) as HTMLDivElement | null;

  const detachIfGone = () => {
    if (!target || document.contains(target)) return false;
    target = null;
    box?.remove();
    box = null;
    return true;
  };

  const paint = () => {
    detachIfGone();
    if (!visible || !target) {
      box?.remove();
      box = null;
      return;
    }
    if (!box || !box.isConnected) {
      box?.remove();
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

  const hide = () => {
    visible = false;
    box?.remove();
    box = null;
  };

  const reveal = () => {
    detachIfGone();
    visible = Boolean(target);
    paint();
  };

  const clear = () => {
    visible = false;
    target = null;
    box?.remove();
    box = null;
  };

  const show = (element: Element) => {
    target = findProductRefHost(element);
    visible = Boolean(target);
    paint();
  };

  const observer = new MutationObserver(() => {
    detachIfGone();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('scroll', paint, true);
  window.addEventListener('resize', paint);

  return {
    show,
    hide,
    reveal,
    clear,
    get active() {
      return Boolean(target);
    },
    destroy: () => {
      observer.disconnect();
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
  let pageContextTimer: number | undefined;
  const controller: ElementSelectorController = init({
    activationKey: 'alt',
    silent: true,
  });

  const stopPicking = () => {
    selecting = false;
    controller.deactivate();
    controller.clearSelected();
  };

  const destroyHighlights = () => {
    stopPicking();
    highlight.clear();
    removeSelectorOverlays();
  };

  const setSelecting = (next: boolean) => {
    selecting = next;
    if (next) {
      controller.activate();
      return;
    }
    controller.deactivate();
    controller.clearSelected();
    removeSelectorOverlays();
  };

  const api = inspectorApi();

  const emitPageContext = () => {
    const payload: InspectorPageContext = {
      route: currentRoute(),
      visibleRefs: collectVisibleProductRefs(),
    };
    api?.sendPageContext(payload);
  };

  const schedulePageContext = (clearHighlight: boolean) => {
    if (clearHighlight) highlight.clear();
    window.clearTimeout(pageContextTimer);
    pageContextTimer = window.setTimeout(emitPageContext, PAGE_CONTEXT_DELAY_MS);
  };

  const onClick = (event: MouseEvent) => {
    if (!selecting || !(event.target instanceof Element)) return;
    event.preventDefault();
    event.stopPropagation();
    const payload: InspectorSelection = {
      productRefs: collectProductRefsFromElement(event.target),
      route: currentRoute(),
      source: 'inspect',
    };
    stopPicking();
    highlight.show(event.target);
    api?.sendSelection(payload);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || (!selecting && !highlight.active)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    destroyHighlights();
    api?.sendCancel();
  };

  const onHashChange = () => schedulePageContext(true);

  document.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('hashchange', onHashChange);

  const unsubscribeSelecting = api?.onSetSelecting?.(setSelecting);
  const unsubscribeHighlightVisible = api?.onSetHighlightVisible?.((visible) => {
    if (visible) {
      highlight.reveal();
      return;
    }
    highlight.hide();
    removeSelectorOverlays();
  });
  const unsubscribeCancel = api?.onCancel?.(() => {
    destroyHighlights();
  });
  const unsubscribeRequestPageContext = api?.onRequestPageContext?.(emitPageContext);

  schedulePageContext(false);

  return {
    destroy: () => {
      unsubscribeSelecting?.();
      unsubscribeHighlightVisible?.();
      unsubscribeCancel?.();
      unsubscribeRequestPageContext?.();
      window.clearTimeout(pageContextTimer);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('hashchange', onHashChange);
      destroyHighlights();
      controller.destroy();
      highlight.destroy();
      document.getElementById(OVERLAY_STYLE_ID)?.remove();
    },
  };
}
