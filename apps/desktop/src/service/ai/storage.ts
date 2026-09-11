import { pluginStore } from '@true-north/plugin-sdk/host';
import type { HostStorageRuntime } from '@true-north/plugin-sdk/host';

/** Host AI schema namespace in the shared store (not a plugin id). */
export const HOST_AI_STORE_ID = 'ai' as const;

export function store(): HostStorageRuntime {
  return pluginStore(HOST_AI_STORE_ID);
}
