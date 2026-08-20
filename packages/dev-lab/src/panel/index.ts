/// <reference types="vite/client" />
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { LabApp } from './LabPanel';
import './style.css';

const ROOT_ID = 'lab-root';

export function bootstrapLabPanel(): { destroy: () => void } {
  const rootEl = document.getElementById(ROOT_ID);
  if (!rootEl) throw new Error(`#${ROOT_ID} is required`);
  const root: Root = createRoot(rootEl);
  root.render(createElement(LabApp));
  return {
    destroy: () => {
      root.unmount();
    },
  };
}
