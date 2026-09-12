import type { HostStorageRuntime } from '@true-north/plugin-sdk/main';
import { getPluginHost } from '../../plugin/active-host';
import { HOST_AI_STORE_ID } from '../../plugin/host-ids';

export { HOST_AI_STORE_ID };

export function store(): HostStorageRuntime {
  return getPluginHost().storage.get(HOST_AI_STORE_ID);
}
