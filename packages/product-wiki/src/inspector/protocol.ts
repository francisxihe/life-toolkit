import type { ProductRef } from '../reference';

export const inspectorChannel = {
  cancel: 'product-wiki:cancel',
  selection: 'product-wiki:selection',
  setSelecting: 'product-wiki:set-selecting',
  setVisible: 'product-wiki:set-visible',
  splitterCapturing: 'product-wiki:splitter-capturing',
  splitterDragStart: 'product-wiki:splitter-drag-start',
  splitterDragMove: 'product-wiki:splitter-drag-move',
  splitterDragEnd: 'product-wiki:splitter-drag-end',
} as const;

export type InspectorSelection = {
  productRefs: ProductRef[];
  route: string;
};

export type ProductWikiInspectorBridge = {
  sendSelection: (payload: InspectorSelection) => void;
  sendCancel: () => void;
  onSetSelecting: (listener: (selecting: boolean) => void) => () => void;
  onCancel: (listener: () => void) => () => void;
};

export type InspectorWidthEdge = 'left' | 'right';

export type ProductWikiInspectorPanel = {
  sendSetSelecting: (selecting: boolean) => void;
  sendCancel: () => void;
  sendSetVisible: (visible: boolean) => void;
  sendSplitterDragStart: (edge: InspectorWidthEdge, screenX: number) => void;
  sendSplitterDragMove: (screenX: number) => void;
  sendSplitterDragEnd: (screenX?: number) => void;
  onSelection: (listener: (payload: InspectorSelection) => void) => () => void;
  onCancel: (listener: () => void) => () => void;
  onSplitterDragEnd: (listener: () => void) => () => void;
};

declare global {
  interface Window {
    productWikiInspectorBridge?: ProductWikiInspectorBridge;
    productWikiInspectorPanel?: ProductWikiInspectorPanel;
  }
}
