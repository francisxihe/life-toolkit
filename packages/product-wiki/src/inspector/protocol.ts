import type { ProductRef } from '../reference';

export const inspectorChannel = {
  cancel: 'product-wiki:cancel',
  selection: 'product-wiki:selection',
  pageContext: 'product-wiki:page-context',
  requestPageContext: 'product-wiki:request-page-context',
  setSelecting: 'product-wiki:set-selecting',
  setHighlightVisible: 'product-wiki:set-highlight-visible',
  setVisible: 'product-wiki:set-visible',
  splitterCapturing: 'product-wiki:splitter-capturing',
  splitterDragStart: 'product-wiki:splitter-drag-start',
  splitterDragMove: 'product-wiki:splitter-drag-move',
  splitterDragEnd: 'product-wiki:splitter-drag-end',
} as const;

export type InspectorSelectionSource = 'inspect' | 'page';

export type InspectorSelection = {
  productRefs: ProductRef[];
  route: string;
  source?: InspectorSelectionSource;
};

export type InspectorPageContext = {
  route: string;
  visibleRefs: ProductRef[];
};

export type ProductWikiInspectorBridge = {
  sendSelection: (payload: InspectorSelection) => void;
  sendCancel: () => void;
  sendPageContext: (payload: InspectorPageContext) => void;
  onSetSelecting: (listener: (selecting: boolean) => void) => () => void;
  onSetHighlightVisible: (listener: (visible: boolean) => void) => () => void;
  onCancel: (listener: () => void) => () => void;
  onRequestPageContext: (listener: () => void) => () => void;
};

export type InspectorWidthEdge = 'left' | 'right';

export type ProductWikiInspectorPanel = {
  sendSetSelecting: (selecting: boolean) => void;
  sendSetHighlightVisible: (visible: boolean) => void;
  sendCancel: () => void;
  sendSetVisible: (visible: boolean) => void;
  sendRequestPageContext: () => void;
  sendSplitterDragStart: (edge: InspectorWidthEdge, screenX: number) => void;
  sendSplitterDragMove: (screenX: number) => void;
  sendSplitterDragEnd: (screenX?: number) => void;
  onSelection: (listener: (payload: InspectorSelection) => void) => () => void;
  onPageContext: (listener: (payload: InspectorPageContext) => void) => () => void;
  onCancel: (listener: () => void) => () => void;
  onSplitterDragEnd: (listener: () => void) => () => void;
};

declare global {
  interface Window {
    productWikiInspectorBridge?: ProductWikiInspectorBridge;
    productWikiInspectorPanel?: ProductWikiInspectorPanel;
  }
}
