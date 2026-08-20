import type { ElementContext } from 'fe-selector/core';
import type { ProductRef } from '../src/product-wiki';

export const inspectorMessage = {
  cancel: 'prototype-inspector:cancel',
  panel: 'prototype-inspector:panel',
  selection: 'prototype-inspector:selection',
  selector: 'prototype-inspector:selector',
} as const;

export type InspectorSelection = {
  id: number;
  context: ElementContext;
  productRef?: ProductRef;
};

export type InspectorSelector = {
  id: number;
  cssSelector?: string;
};
