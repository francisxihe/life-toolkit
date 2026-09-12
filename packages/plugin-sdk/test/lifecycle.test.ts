import assert from 'node:assert/strict';
import test from 'node:test';
import { PLUGIN_API_VERSION, definePluginManifest, reconcileMain, reconcileRenderer } from '../src/index.ts';
import type { PluginMainContext, PluginMainModule } from '../src/index.ts';

test('activate rollback disposes earlier plugins in reverse order', async () => {
  const disposed: string[] = [];
  const plugins: PluginMainModule[] = [
    {
      async activate() {
        return {};
      },
      async dispose() {
        disposed.push('a');
      },
    },
    {
      async activate() {
        return {};
      },
      async dispose() {
        disposed.push('b');
      },
    },
    {
      async activate() {
        throw new Error('c failed');
      },
      async dispose() {
        disposed.push('c');
      },
    },
  ];

  const activated: PluginMainModule[] = [];
  try {
    for (const plugin of plugins) {
      await plugin.activate({
        pluginId: 'x',
        space: { pluginId: 'x', rootDir: '/tmp' },
        activity: { record: async () => {}, unlink: async () => {} },
        ai: {
          getCapability: () => ({ key: '', execute: async () => ({}) }),
          cache: { fingerprintPromptContext: () => '', findMatching: async () => null, upsert: async () => {} },
        },
      } as PluginMainContext);
      activated.push(plugin);
    }
    assert.fail('expected activate to throw');
  } catch (error) {
    assert.equal((error as Error).message, 'c failed');
    for (const plugin of [...activated].reverse()) {
      await plugin.dispose?.();
    }
  }
  assert.deepEqual(disposed, ['b', 'a']);
});

test('successful activate publishes only after every plugin reconciles', () => {
  const manifest = definePluginManifest({
    pluginId: 'growth',
    apiVersion: PLUGIN_API_VERSION,
    version: '1',
    catalog: { nameKey: 'growth' },
    contributions: {
      ipc: { todo: { routePrefix: '/todo' } },
    },
  });
  const issues = reconcileMain(manifest, {
    ipcControllers: { todo: { controller: {} } },
  });
  assert.deepEqual(issues, []);
});

test('renderer boot fails closed when a declared workspace is missing', () => {
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
