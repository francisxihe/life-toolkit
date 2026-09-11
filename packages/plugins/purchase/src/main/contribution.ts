import { PurchaseStatus } from '@true-north/enum';
import type { PluginMainContribution, PluginMainContext, TodayContribution } from '@true-north/plugin-sdk';
import { PurchaseController } from './service/purchase.route-controller';
import { purchaseCaptureAdopter } from './service/capture.adopter';
import { purchaseService } from './service/purchase.service';
import { bindActivityPort } from './ports';
import { activateStorage, disposeStorage } from './storage';
import { purchaseQuery } from './query';

const today: TodayContribution = {
  pluginId: 'purchase',
  async collect() {
    const purchases = await purchaseService.list({ status: PurchaseStatus.PENDING });
    return {
      pendingPurchases: purchases.length,
      purchases: purchases.map((item) => ({ id: item.id, name: item.name, neededAt: item.neededAt })),
    };
  },
};

export function createPurchaseMain(): PluginMainContribution {
  return {
    ipcControllers: [{ id: 'purchase', routePrefix: '/purchase', controller: PurchaseController }],
    query: purchaseQuery,
    captureAdopters: [purchaseCaptureAdopter],
    today,
    async activate(ctx: PluginMainContext) {
      await activateStorage(ctx.space);
      bindActivityPort(ctx.activity);
    },
    async dispose() {
      await disposeStorage();
    },
  };
}
