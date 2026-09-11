import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PLUGIN_API_VERSION,
  parsePluginManifest,
  validateManifests,
  assemblePluginCatalog,
} from '../src/index.ts';
import type { PluginManifest } from '../src/index.ts';

function manifest(overrides: Partial<PluginManifest> & Pick<PluginManifest, 'pluginId'>): PluginManifest {
  return parsePluginManifest({
    apiVersion: PLUGIN_API_VERSION,
    version: '0.1.0',
    contributions: {},
    ...overrides,
  });
}

test('rejects mismatched API version', () => {
  const issues = validateManifests([
    {
      ...manifest({ pluginId: 'activity', required: true }),
      apiVersion: '0.9' as never,
    },
  ]);
  assert.equal(issues.some((issue) => issue.code === 'api-version'), true);
});

test('rejects missing dependencies', () => {
  const issues = validateManifests([
    manifest({ pluginId: 'growth', dependencies: ['activity'] }),
  ]);
  assert.equal(issues.some((issue) => issue.code === 'missing-dependency'), true);
});

test('rejects dependency cycles', () => {
  const issues = validateManifests([
    manifest({ pluginId: 'activity', required: true, dependencies: ['growth'] }),
    manifest({ pluginId: 'growth', dependencies: ['activity'] }),
  ]);
  assert.equal(issues.some((issue) => issue.code === 'cycle'), true);
});

test('rejects duplicate controllers, tools, workspaces, and entity types', () => {
  const issues = validateManifests([
    manifest({
      pluginId: 'activity',
      required: true,
      contributions: {
        ipc: [{ id: 'ctrl', routePrefix: '/dup' }],
        ai: { toolNames: ['shared_tool'], entityTypes: ['goal'] },
        workbench: { workspaceKeys: ['goal.decompose'] },
        storage: { entityTypes: ['card'] },
      },
    }),
    manifest({
      pluginId: 'growth',
      contributions: {
        ipc: [{ id: 'ctrl2', routePrefix: '/dup' }],
        ai: { toolNames: ['shared_tool'], entityTypes: ['goal'] },
        workbench: { workspaceKeys: ['goal.decompose'] },
        storage: { entityTypes: ['card'] },
      },
    }),
  ]);
  const codes = new Set(issues.map((issue) => issue.code));
  assert.equal(codes.has('duplicate-controller'), true);
  assert.equal(codes.has('duplicate-tool'), true);
  assert.equal(codes.has('duplicate-workspace'), true);
  assert.equal(codes.has('duplicate-entity-type'), true);
});

test('same plugin may declare overlapping storage, activity, and ai entity types', () => {
  const issues = validateManifests([
    manifest({
      pluginId: 'growth',
      contributions: {
        ai: { entityTypes: ['goal'] },
        activity: { entityTypes: ['goal', 'todo'] },
        storage: {
          entityTypes: ['goal', 'todo', 'repeat'],
        },
      },
    }),
  ]);
  assert.equal(issues.some((issue) => issue.code === 'duplicate-entity-type'), false);
});

test('required plugins cannot be disabled', () => {
  const issues = validateManifests(
    [manifest({ pluginId: 'activity', required: true })],
    { disabledPluginIds: ['activity', 'growth'] },
  );
  assert.equal(issues.some((issue) => issue.code === 'required-disabled' && issue.pluginId === 'activity'), true);
});

test('assemble skips optional plugins when disabled', async () => {
  const catalog = await assemblePluginCatalog(
    [
      { manifest: manifest({ pluginId: 'activity', required: true }) },
      { manifest: manifest({ pluginId: 'growth', dependencies: ['activity'] }) },
    ],
    { disabledPluginIds: ['growth'], loadRuntime: false },
  );
  assert.deepEqual(
    catalog.plugins.map((plugin) => plugin.manifest.pluginId),
    ['activity'],
  );
});
