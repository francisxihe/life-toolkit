import { pluginStore } from '@true-north/plugin-sdk/host';
import type { HostStorageRuntime } from '@true-north/plugin-sdk/host';

/** Host Activity schema namespace in the shared store (not a plugin id). */
export const HOST_ACTIVITY_STORE_ID = 'activity' as const;

export function store(): HostStorageRuntime {
  return pluginStore(HOST_ACTIVITY_STORE_ID);
}
