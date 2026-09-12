import { PurchaseStatus } from '@true-north/enum';
import { defineMainImplementation, namespacedId, type PluginMainContext } from '@true-north/plugin-sdk';
import { purchaseManifest } from '../plugin';
import { PurchaseController } from './service/purchase.route-controller';
import { purchaseCaptureAdopter } from './service/capture.adopter';
import { purchaseService } from './service/purchase.service';
import { bindPurchaseContext } from './context';
import { activateStorage, disposeStorage } from './storage';
import { createPurchaseQuery } from './query';

export function createPurchaseMain() {
  return defineMainImplementation(purchaseManifest, {
    async activate(ctx: PluginMainContext) {
      const runtime = await activateStorage(ctx.space);
      bindPurchaseContext(ctx.activity);
      const purchases = async () => purchaseService.list({ status: PurchaseStatus.PENDING });
      return {
        ipcControllers: { purchase: { controller: new PurchaseController() } },
        query: createPurchaseQuery(runtime),
        captureAdopters: [purchaseCaptureAdopter],
        todaySections: [
          {
            id: namespacedId('purchase', 'pending'),
            async collect() {
              const list = await purchases();
              return {
                id: namespacedId('purchase', 'pending'),
                kind: 'metric' as const,
                titleKey: 'plugins.hub.pendingPurchases',
                order: 20,
                value: list.length,
              };
            },
          },
          {
            id: namespacedId('purchase', 'purchases'),
            async collect() {
              const list = await purchases();
              return {
                id: namespacedId('purchase', 'purchases'),
                kind: 'list' as const,
                titleKey: 'menu.purchase',
                order: 40,
                items: list.map((item) => ({
                  id: item.id,
                  label: item.name,
                  pluginId: 'purchase',
                  entityType: 'purchase',
                })),
              };
            },
          },
        ],
      };
    },
    async dispose() {
      await disposeStorage();
    },
  });
}
