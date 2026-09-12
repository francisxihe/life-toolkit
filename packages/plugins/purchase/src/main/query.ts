import { createRepositoryQueryPort, type HostStorageRuntime } from '@true-north/plugin-sdk/main';
import type { PluginQueryPort } from '@true-north/plugin-sdk';
import { PurchaseItem } from './service/purchase.entity';
import { PLUGIN_ID } from './storage';

export function createPurchaseQuery(runtime: HostStorageRuntime): PluginQueryPort {
  return createRepositoryQueryPort(PLUGIN_ID, runtime, [
    { entityType: 'purchase', entity: PurchaseItem, label: (row) => String(row.name || row.id) },
  ]);
}
