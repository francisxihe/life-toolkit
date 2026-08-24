import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InspectorApp } from './InspectorApp';
import { createWikiRuntime } from '../../runtime';
import type { ProductWikiData } from '../../types';
import '../style.css';

const ROOT_ID = 'product-wiki-inspector';

export function bootstrapProductInspectorPanel(options: { wiki: ProductWikiData }): { destroy: () => void } {
  const rootEl = document.getElementById(ROOT_ID);
  if (!rootEl) throw new Error(`#${ROOT_ID} is required`);
  const runtime = createWikiRuntime(options.wiki);
  const root: Root = createRoot(rootEl);
  root.render(createElement(InspectorApp, { runtime }));
  return {
    destroy: () => {
      root.unmount();
    },
  };
}
