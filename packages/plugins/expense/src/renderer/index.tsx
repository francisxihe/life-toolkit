import type { PluginRendererContribution } from '@true-north/plugin-sdk';
import { Wallet } from 'lucide-react';
import { expenseHref } from '../contract';
import { expenseLocales } from './locales';

export function createRenderer(): PluginRendererContribution {
  return {
    nameKey: 'menu.expense',
    icon: Wallet,
    descriptionKey: 'expense.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['expense', 'budget', 'transaction', '记账', '预算', '账单'],
    order: 20,
    load: () => import('./pages/index'),
    locales: [expenseLocales],
    entityPresenters: [
      { pluginId: 'expense', entityType: 'transaction', kindLabel: '记账', openPath: () => expenseHref('transaction') },
    ],
  };
}
