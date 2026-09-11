import { createRepositoryQueryPort } from '@true-north/plugin-sdk/host';
import type { PluginQueryPort } from '@true-north/plugin-sdk';
import { PurchaseItem } from './service/purchase.entity';
import { PLUGIN_ID } from './storage';

export const purchaseQuery: PluginQueryPort = createRepositoryQueryPort(PLUGIN_ID, [
  { entityType: 'purchase', entity: PurchaseItem, label: (row) => String(row.name || row.id) },
]);
