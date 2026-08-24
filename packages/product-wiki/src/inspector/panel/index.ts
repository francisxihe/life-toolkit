import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InspectorApp } from './InspectorApp';
import '../style.css';

const ROOT_ID = 'product-wiki-inspector';

export function bootstrapProductInspectorPanel(): { destroy: () => void } {
  const rootEl = document.getElementById(ROOT_ID);
  if (!rootEl) throw new Error(`#${ROOT_ID} is required`);
  const root: Root = createRoot(rootEl);
  root.render(createElement(InspectorApp));
  return {
    destroy: () => {
      root.unmount();
    },
  };
}
