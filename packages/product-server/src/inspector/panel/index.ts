import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InspectorApp } from './InspectorApp';
import { createWikiRuntime } from '../../runtime';
import type { ProductWikiData } from '../../types';
import { applyInspectorTheme, type InspectorTheme } from '../theme';
import '../style.css';

const ROOT_ID = 'product-wiki-inspector';

export type { InspectorTheme };

export function bootstrapProductInspectorPanel(options: {
  wiki: ProductWikiData;
  theme?: InspectorTheme;
}): { destroy: () => void; setTheme: (theme: InspectorTheme) => void } {
  const rootEl = document.getElementById(ROOT_ID);
  if (!rootEl) throw new Error(`#${ROOT_ID} is required`);
  const runtime = createWikiRuntime(options.wiki);
  const root: Root = createRoot(rootEl);
  let theme: InspectorTheme = options.theme ?? 'light';

  const render = () => {
    applyInspectorTheme(theme);
    root.render(createElement(InspectorApp, { runtime, theme }));
  };
  render();
  return {
    destroy: () => {
      root.unmount();
    },
    setTheme: (next) => {
      theme = next;
      render();
    },
  };
}
