import { pluginPath } from '@true-north/plugin-sdk';

export const PURCHASE_PLUGIN_ID = 'purchase';

export const purchasePaths = {
  root: pluginPath(PURCHASE_PLUGIN_ID),
} as const;
