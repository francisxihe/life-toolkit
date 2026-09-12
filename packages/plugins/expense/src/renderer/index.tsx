import { Wallet } from 'lucide-react';
import { defineRendererImplementation } from '@true-north/plugin-sdk';
import { expenseManifest } from '../plugin';
import { expenseHref } from '../contract';
import { expenseLocales } from './locales';
import { bindPluginIpc } from '../client';

export function createRenderer() {
  return defineRendererImplementation(expenseManifest, {
    activate(ctx) {
      bindPluginIpc(ctx.ipc);
      return {
        icon: Wallet,
        load: () => import('./pages/index'),
        locales: [expenseLocales],
        entityPresenters: [
          { pluginId: 'expense', entityType: 'transaction', kindLabel: '记账', openPath: () => expenseHref('transaction') },
        ],
      };
    },
  });
}
