import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PLUGIN_API_VERSION,
  REQUIRED_PLUGIN_IDS,
  assemblePluginCatalog,
  validateManifests,
  parsePluginManifest,
  normalizeCaptureSuggestion,
  mergeTodaySnapshots,
  activityRefFromLegacyDomain,
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

test('host catalog can assemble with no required plugins', async () => {
  const catalog = await assemblePluginCatalog([], { loadRuntime: false });
  assert.deepEqual(catalog.plugins, []);
  assert.equal(catalog.issues.length, 0);
  assert.deepEqual([...REQUIRED_PLUGIN_IDS], []);
});

test('adding growth surfaces ipc, ai, workbench and today', async () => {
  const catalog = await assemblePluginCatalog(
    [
      {
        manifest: manifest({
          pluginId: 'growth',
          contributions: {
            ipc: [{ id: 'todo', routePrefix: '/todo' }],
            ai: { toolNames: ['search_goals'], capabilityKeys: ['goal.decompose'] },
            workbench: { workspaceKeys: ['goal.decompose'] },
            activity: { today: true, entityTypes: ['todo'] },
          },
        }),
      },
    ],
    { loadRuntime: false },
  );
  const growth = catalog.plugins.find((plugin) => plugin.manifest.pluginId === 'growth');
  assert.ok(growth);
  assert.equal(growth.manifest.contributions.ipc?.[0]?.routePrefix, '/todo');
  assert.equal(growth.manifest.contributions.ai?.toolNames?.[0], 'search_goals');
  assert.equal(growth.manifest.contributions.workbench?.workspaceKeys?.[0], 'goal.decompose');
  assert.equal(growth.manifest.contributions.activity?.today, true);
  assert.equal(catalog.plugins.some((plugin) => plugin.manifest.pluginId === 'ai'), false);
  assert.equal(catalog.plugins.some((plugin) => plugin.manifest.pluginId === 'workbench'), false);
  assert.equal(catalog.plugins.some((plugin) => plugin.manifest.pluginId === 'activity'), false);
});

test('disabling optional plugin does not assemble it', async () => {
  const catalog = await assemblePluginCatalog(
    [
      { manifest: manifest({ pluginId: 'growth' }) },
      { manifest: manifest({ pluginId: 'expense' }) },
    ],
    { disabledPluginIds: ['growth'], loadRuntime: false },
  );
  assert.deepEqual(
    catalog.plugins.map((plugin) => plugin.manifest.pluginId),
    ['expense'],
  );
});

test('required plugins cannot be disabled', () => {
  const issues = validateManifests(
    [manifest({ pluginId: 'growth', required: true })],
    { disabledPluginIds: ['growth'] },
  );
  assert.equal(issues.some((issue) => issue.code === 'required-disabled'), true);
});

test('capture suggestion normalizes legacy kind', () => {
  const next = normalizeCaptureSuggestion({ id: 's1', kind: 'todo', payload: { title: 'x' } } as never);
  assert.equal(next.type, 'growth.todo');
});

test('today snapshots merge across plugins', () => {
  const merged = mergeTodaySnapshots([
    { focusSeconds: 10, todos: [{ id: '1', name: 'a', planDate: '2026-09-11', overdue: false }] },
    { focusSeconds: 5, habits: [{ id: 'h', name: 'b' }] },
  ]);
  assert.equal(merged.focusSeconds, 15);
  assert.equal(merged.todos.length, 1);
  assert.equal(merged.habits.length, 1);
});

test('legacy activity domain maps to plugin entity ref', () => {
  const ref = activityRefFromLegacyDomain('todo', 'abc');
  assert.deepEqual(ref, { pluginId: 'growth', entityType: 'todo', entityId: 'abc' });
});
