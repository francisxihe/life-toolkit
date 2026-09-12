import 'reflect-metadata';
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PLUGIN_API_VERSION,
  definePluginManifest,
  parsePluginManifest,
  validateManifests,
  mergeTodaySections,
} from '../src/index.ts';
import { reconcileMain, reconcileRenderer } from '../src/reconcile.ts';
import { HostActionRegistry } from '../src/runtime.ts';
import { StorageRegistry, createHostStorageRuntime } from '../src/host/storage-runtime.ts';

function growthManifest() {
  return definePluginManifest({
    pluginId: 'growth',
    apiVersion: PLUGIN_API_VERSION,
    version: '0.1.0',
    catalog: { nameKey: 'menu.growth' },
    hostCapabilities: ['ipc', 'ai', 'activity'],
    contributions: {
      ipc: {
        todo: { routePrefix: '/todo' },
        'track-time': { routePrefix: '/trackTime' },
      },
      ai: {
        capabilities: { decompose: { key: 'goal.decompose' } },
        tools: { search_goals: { name: 'search_goals' } },
      },
      activity: {
        captureTypes: { todo: { type: 'growth.todo' } },
        today: { todos: { kind: 'list', titleKey: 'today.todos' } },
      },
    },
  });
}

function matchingMainHandles(controller: object = {}) {
  return {
    ipcControllers: {
      todo: { controller: {} },
      'track-time': { controller },
    },
    ai: {
      capabilities: [{ key: 'goal.decompose', execute: async () => ({}) }],
      tools: [
        {
          name: 'search_goals',
          description: '',
          parameters: {},
          schema: { parse: (value: unknown) => value },
          execute: async () => '',
        },
      ],
    },
    captureAdopters: [
      { type: 'growth.todo', adopt: async () => ({ pluginId: 'growth', entityType: 'todo', entityId: '1' }) },
    ],
    todaySections: [
      { id: 'growth.todos', collect: async () => ({ id: 'growth.todos', kind: 'list' as const, titleKey: 'today.todos' }) },
    ],
  };
}

test('JSON round-trip keeps contribution maps', () => {
  const json = JSON.parse(JSON.stringify(growthManifest()));
  const parsed = parsePluginManifest(json);
  assert.equal(parsed.contributions.ipc?.['track-time']?.routePrefix, '/trackTime');
  assert.equal(parsed.contributions.ai?.capabilities?.decompose?.key, 'goal.decompose');
});

test('reconcile fails when controller prefix drifts from /trackTime', () => {
  class TrackTimeController {}
  Reflect.defineMetadata('controller:path', '/track-time', TrackTimeController);
  const issues = reconcileMain(growthManifest(), matchingMainHandles(new TrackTimeController()));
  assert.equal(
    issues.some((issue) => issue.message.includes('/trackTime') && issue.message.includes('/track-time')),
    true,
  );
});

test('reconcile passes when controller prefix matches /trackTime', () => {
  class TrackTimeController {}
  Reflect.defineMetadata('controller:path', '/trackTime', TrackTimeController);
  const issues = reconcileMain(growthManifest(), matchingMainHandles(new TrackTimeController()));
  assert.deepEqual(issues, []);
});

test('reconcile fails on missing renderer workspace', () => {
  const manifest = definePluginManifest({
    pluginId: 'growth',
    apiVersion: PLUGIN_API_VERSION,
    version: '1',
    catalog: { nameKey: 'growth' },
    contributions: {
      workbench: { workspaces: { decompose: { key: 'goal.decompose' } } },
    },
  });
  const issues = reconcileRenderer(manifest, { load: async () => ({ default: () => null }) });
  assert.equal(issues.some((issue) => issue.message.includes('goal.decompose')), true);
});

test('host action registry isolates two hosts', async () => {
  const a = new HostActionRegistry();
  const b = new HostActionRegistry();
  const seen: string[] = [];
  a.register('open', () => {
    seen.push('a');
  });
  b.register('open', () => {
    seen.push('b');
  });
  await a.invoke('open');
  assert.deepEqual(seen, ['a']);
});

test('storage registries do not share module state', async () => {
  const hostDb = {
    manager: { id: 'host' },
    query: async () => [],
    getRepository: () => ({}),
    getTreeRepository: () => ({}),
    async transaction(run: (tx: unknown) => Promise<unknown>) {
      return run({ id: 'tx', query: async () => [], getRepository: () => ({}) });
    },
  } as never;
  const pluginDb = {
    manager: { id: 'plugin' },
    query: async () => [],
    getRepository: () => ({}),
    getTreeRepository: () => ({}),
    async transaction(run: (tx: unknown) => Promise<unknown>) {
      return run({ id: 'plugin-tx', query: async () => [], getRepository: () => ({}) });
    },
  } as never;
  const first = new StorageRegistry();
  const second = new StorageRegistry();
  const hostRuntime = createHostStorageRuntime(hostDb, undefined, { registry: first });
  const pluginRuntime = createHostStorageRuntime(pluginDb, undefined, { registry: first });
  first.bind('host:ai', hostRuntime);
  first.bind('growth', pluginRuntime);
  second.bind('host:ai', createHostStorageRuntime(hostDb, undefined, { registry: second }));
  await hostRuntime.runInTransaction(async (tx) => {
    assert.equal(first.get('host:ai').manager, tx.manager);
    assert.equal(first.get('growth').dataSource, pluginDb);
    assert.notEqual(second.get('host:ai').manager, tx.manager);
  });
});

test('validateManifests still reports duplicate routes', () => {
  const issues = validateManifests([
    definePluginManifest({
      pluginId: 'a',
      apiVersion: PLUGIN_API_VERSION,
      version: '1',
      catalog: { nameKey: 'a' },
      contributions: { ipc: { one: { routePrefix: '/dup' } } },
    }),
    definePluginManifest({
      pluginId: 'b',
      apiVersion: PLUGIN_API_VERSION,
      version: '1',
      catalog: { nameKey: 'b' },
      contributions: { ipc: { two: { routePrefix: '/dup' } } },
    }),
  ]);
  assert.equal(issues.some((issue) => issue.code === 'duplicate-controller'), true);
});

test('today sections merge by order', () => {
  const merged = mergeTodaySections([
    [{ id: 'growth.focus', kind: 'metric', titleKey: 'focus', order: 20, value: 10 }],
    [{ id: 'expense.spent', kind: 'metric', titleKey: 'spent', order: 10, value: 5 }],
  ]);
  assert.equal(merged[0]?.id, 'expense.spent');
});
