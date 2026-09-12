import { ShoppingCart } from 'lucide-react';
import { defineRendererImplementation } from '@true-north/plugin-sdk';
import { purchaseManifest } from '../plugin';
import { purchasePaths } from '../contract';
import { purchaseLocales } from './locales';
import { bindPluginIpc } from '../client';

export function createRenderer() {
  return defineRendererImplementation(purchaseManifest, {
    activate(ctx) {
      bindPluginIpc(ctx.ipc);
      return {
        icon: ShoppingCart,
        load: () => import('./pages/index'),
        locales: [purchaseLocales],
        entityPresenters: [
          { pluginId: 'purchase', entityType: 'purchase', kindLabel: '采购', openPath: () => purchasePaths.root },
        ],
      };
    },
  });
}
