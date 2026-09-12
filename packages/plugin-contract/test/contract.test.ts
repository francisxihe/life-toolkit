import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PLUGIN_API_VERSION,
  definePluginManifest,
  parsePluginManifest,
  validateManifests,
  mergeTodaySections,
  namespacedId,
  pluginPath,
} from '../src/index.ts';

test('round-trips a serializable v2 manifest', () => {
  const manifest = definePluginManifest({
    pluginId: 'expense',
    apiVersion: PLUGIN_API_VERSION,
    version: '0.1.0',
    catalog: { nameKey: 'menu.expense' },
    hostCapabilities: ['activity', 'storage', 'ipc'],
    contributions: {
      ipc: { expense: { routePrefix: '/expense' } },
      activity: {
        captureTypes: { transaction: { type: 'expense.transaction' } },
        entityTypes: ['transaction'],
        today: { spent: { kind: 'metric', titleKey: 'plugins.hub.spent' } },
      },
      storage: { capability: 'self-managed', entityTypes: ['transaction', 'budget'] },
    },
  });
  const json = JSON.parse(JSON.stringify(manifest));
  assert.deepEqual(parsePluginManifest(json).pluginId, 'expense');
  assert.equal(pluginPath('expense'), '/plugins/expense');
  assert.equal(namespacedId('expense', 'transaction'), 'expense.transaction');
});

test('rejects duplicate routes, tools, and namespaced entity types', () => {
  const issues = validateManifests([
    definePluginManifest({
      pluginId: 'a',
      apiVersion: PLUGIN_API_VERSION,
      version: '1',
      catalog: { nameKey: 'a' },
      contributions: {
        ipc: { one: { routePrefix: '/dup' } },
        ai: { tools: { shared: { name: 'shared_tool' } }, entityTypes: ['goal'] },
      },
    }),
    definePluginManifest({
      pluginId: 'b',
      apiVersion: PLUGIN_API_VERSION,
      version: '1',
      catalog: { nameKey: 'b' },
      contributions: {
        ipc: { two: { routePrefix: '/dup' } },
        ai: { tools: { shared: { name: 'shared_tool' } }, entityTypes: ['goal'] },
      },
    }),
  ]);
  const codes = new Set(issues.map((issue) => issue.code));
  assert.equal(codes.has('duplicate-controller'), true);
  assert.equal(codes.has('duplicate-tool'), true);
  assert.equal(codes.has('duplicate-entity-type'), false);
});

test('same plugin may overlap storage, activity, and ai entity types', () => {
  const issues = validateManifests([
    definePluginManifest({
      pluginId: 'growth',
      apiVersion: PLUGIN_API_VERSION,
      version: '1',
      catalog: { nameKey: 'growth' },
      contributions: {
        ai: { entityTypes: ['goal'] },
        activity: { entityTypes: ['goal', 'todo'] },
        storage: { capability: 'self-managed', entityTypes: ['goal', 'todo'] },
      },
    }),
  ]);
  assert.equal(issues.some((issue) => issue.code === 'duplicate-entity-type'), false);
});

test('merges today sections by order', () => {
  const merged = mergeTodaySections([
    [{ id: 'growth.focus', kind: 'metric', titleKey: 'focus', order: 20, value: 10 }],
    [{ id: 'expense.spent', kind: 'metric', titleKey: 'spent', order: 10, value: 5 }],
  ]);
  assert.equal(merged[0]?.id, 'expense.spent');
  assert.equal(merged[1]?.value, 10);
});
