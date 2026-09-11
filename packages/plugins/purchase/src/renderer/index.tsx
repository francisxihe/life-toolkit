import type { PluginRendererContribution } from '@true-north/plugin-sdk';
import { ShoppingCart } from 'lucide-react';
import { purchasePaths } from '../contract';
import { purchaseLocales } from './locales';

export function createRenderer(): PluginRendererContribution {
  return {
    nameKey: 'menu.purchase',
    icon: ShoppingCart,
    descriptionKey: 'purchase.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['purchase', 'buy', '采购', '待购'],
    order: 30,
    load: () => import('./pages/index'),
    locales: [purchaseLocales],
    entityPresenters: [
      { pluginId: 'purchase', entityType: 'purchase', kindLabel: '采购', openPath: () => purchasePaths.root },
    ],
  };
}
