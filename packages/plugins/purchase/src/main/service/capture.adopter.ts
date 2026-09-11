import type { CaptureAdopter } from '@true-north/plugin-sdk';
import { PurchaseStatus } from '@true-north/enum';
import { purchaseService } from './purchase.service';

export const purchaseCaptureAdopter: CaptureAdopter = {
  type: 'purchase.item',
  async adopt(suggestion) {
    const payload = suggestion.payload || {};
    const item = await purchaseService.create(
      {
        name: String(payload.title || ''),
        quantity: payload.quantity != null ? Number(payload.quantity) : undefined,
        unit: payload.unit ? String(payload.unit) : undefined,
        neededAt: payload.neededAt ? String(payload.neededAt) : payload.planned ? String(payload.planned) : undefined,
        note: payload.note ? String(payload.note) : undefined,
        status: payload.amount ? PurchaseStatus.PURCHASED : PurchaseStatus.PENDING,
        purchasedAt: payload.amount
          ? String(payload.occurredAt || new Date().toISOString())
          : undefined,
      },
      { skipActivity: true },
    );
    return {
      pluginId: 'purchase',
      entityType: 'purchase',
      entityId: item.id,
      role: 'purchase',
      label: item.name,
    };
  },
};
