import { useEffect, useRef } from 'react';
import { installHostDock, type HostDock } from '@ylib/product-dock';
import { attachProductWiki } from '@ylib/product-server/agent';
import type { ViewsTheme } from '@ylib/product-server/channel';
import { useProductRouterPort } from '@ylib/product-surface-react/router';
import { bindLabFrame, type LabFrameHandle } from '@true-north/dev-lab/dock';
import { labPageRoute } from '@true-north/dev-lab/page';

type DevDockTab = 'wiki' | 'lab';
type DevDockAttachProps = {
  theme: ViewsTheme;
};

function syncProductWikiTheme(theme: ViewsTheme): void {
  window.productWikiInspect?.sendSetTheme(theme);
}

type DevDockHandle = {
  activate: (id: DevDockTab) => void;
  setVisible: (visible: boolean) => void;
  isVisible: () => boolean;
  destroy: () => void;
};

declare global {
  interface Window {
    __devDock?: DevDockHandle;
    __devDockPreferred?: { tab: DevDockTab; visible: boolean };
  }
}

function createFrame(src: string, title: string): HTMLIFrameElement {
  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = title;
  return frame;
}

export function DevDockAttach({ theme }: DevDockAttachProps) {
  const router = useProductRouterPort();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const dockRef = useRef<HostDock | null>(null);
  const labRef = useRef<LabFrameHandle | null>(null);
  const isProductDev = import.meta.env.VITE_DEV_PROFILE === 'product';

  useEffect(() => {
    const dock = installHostDock({ minWidth: 480, defaultWidth: 640, theme: themeRef.current });
    dockRef.current = dock;
    let lab: LabFrameHandle | undefined;
    let wiki: { destroy: () => void } | undefined;

    if (isProductDev) {
      const wikiFrame = createFrame(
        window.__productWikiService?.viewsUrl ?? 'http://127.0.0.1:5101/views',
        '讲解面板',
      );
      dock.register({ id: 'wiki', label: '讲解面板', content: wikiFrame });
      wiki = attachProductWiki({
        router,
        onSetVisible: (visible) => dock.setVisible(visible),
      });
      syncProductWikiTheme(themeRef.current);
    } else {
      const labFrame = createFrame(labPageRoute, 'Lab');
      dock.register({ id: 'lab', label: 'Lab', content: labFrame });
      lab = bindLabFrame(labFrame, {
        getTheme: () => (themeRef.current === 'dark' ? 'dark' : 'light'),
        setVisible: (visible) => {
          if (visible) dock.activate('lab');
          else dock.setVisible(false);
        },
      });
      labRef.current = lab;
    }

    const handleApi: DevDockHandle = {
      activate: (id) => dock.activate(id),
      setVisible: (visible) => dock.setVisible(visible),
      isVisible: () => dock.isVisible(),
      destroy: () => {
        lab?.destroy();
        wiki?.destroy();
        dock.destroy();
        if (labRef.current === lab) labRef.current = null;
        if (dockRef.current === dock) dockRef.current = null;
        if (window.__devDock === handleApi) delete window.__devDock;
      },
    };

    window.__devDock = handleApi;
    const preferred = window.__devDockPreferred;
    if (!preferred) {
      if (isProductDev) dock.activate('wiki');
      else dock.setVisible(false);
    } else if (preferred.visible) dock.activate(preferred.tab);
    else dock.setVisible(false);

    return () => {
      handleApi.destroy();
    };
  }, [router, isProductDev]);

  useEffect(() => {
    dockRef.current?.setTheme(theme);
    if (isProductDev) syncProductWikiTheme(theme);
    else labRef.current?.setTheme(theme);
  }, [theme, isProductDev]);

  return null;
}
