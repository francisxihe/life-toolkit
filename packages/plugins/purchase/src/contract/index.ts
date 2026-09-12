import { pluginPath } from '@true-north/plugin-contract';

export const PURCHASE_PLUGIN_ID = 'purchase';

export const purchasePaths = {
  root: pluginPath(PURCHASE_PLUGIN_ID),
} as const;
