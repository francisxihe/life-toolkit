import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bindPluginStore,
  pluginStore,
  unbindPluginStore,
  createHostStorageRuntime,
  storeIdsForDataSource,
} from '../src/host/storage-runtime.ts';

function stubDataSource(id: string) {
  const ds = {
    id,
    manager: { id: `${id}-mgr` },
    query: async () => [],
    getRepository: () => ({}),
    getTreeRepository: () => ({}),
    async transaction(run: (tx: unknown) => Promise<unknown>) {
      const tx = { id: `${id}-tx`, query: async () => [], getRepository: () => ({}) };
      return run(tx);
    },
  };
  return ds as never;
}

test('transaction rebind only affects stores on the same DataSource', async () => {
  const hostDb = stubDataSource('host');
  const pluginDb = stubDataSource('plugin');
  const hostRuntime = createHostStorageRuntime(hostDb);
  const pluginRuntime = createHostStorageRuntime(pluginDb, undefined, { capability: 'self-managed' });
  bindPluginStore('ai', hostRuntime);
  bindPluginStore('activity', hostRuntime);
  bindPluginStore('growth', pluginRuntime);
  try {
    assert.deepEqual(storeIdsForDataSource(hostDb).sort(), ['activity', 'ai']);
    assert.deepEqual(storeIdsForDataSource(pluginDb), ['growth']);
    await hostRuntime.runInTransaction(async (tx) => {
      assert.equal(pluginStore('ai').manager, tx.manager);
      assert.equal(pluginStore('activity').manager, tx.manager);
      assert.equal(pluginStore('growth').dataSource, pluginDb);
    });
    assert.equal(pluginStore('growth').dataSource, pluginDb);
    assert.equal(pluginStore('ai').dataSource, hostDb);
  } finally {
    unbindPluginStore('ai');
    unbindPluginStore('activity');
    unbindPluginStore('growth');
  }
});
