import assert from 'node:assert/strict';
import test from 'node:test';
import { StorageRegistry, createHostStorageRuntime } from '../src/host/storage-runtime.ts';

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
  const registry = new StorageRegistry();
  const hostRuntime = createHostStorageRuntime(hostDb, undefined, { registry });
  const pluginRuntime = createHostStorageRuntime(pluginDb, undefined, { registry, capability: 'self-managed' });
  registry.bind('host:ai', hostRuntime);
  registry.bind('host:activity', hostRuntime);
  registry.bind('growth', pluginRuntime);
  assert.deepEqual(registry.idsForDataSource(hostDb).sort(), ['host:activity', 'host:ai']);
  assert.deepEqual(registry.idsForDataSource(pluginDb), ['growth']);
  await hostRuntime.runInTransaction(async (tx) => {
    assert.equal(registry.get('host:ai').manager, tx.manager);
    assert.equal(registry.get('host:activity').manager, tx.manager);
    assert.equal(registry.get('growth').dataSource, pluginDb);
  });
  assert.equal(registry.get('growth').dataSource, pluginDb);
  assert.equal(registry.get('host:ai').dataSource, hostDb);
});
