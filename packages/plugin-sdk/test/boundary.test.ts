import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function rg(args: string[]) {
  try {
    return execFileSync('rg', args, { cwd: repoRoot, encoding: 'utf8' });
  } catch (error) {
    const err = error as { status?: number; stdout?: string };
    if (err.status === 1) return err.stdout || '';
    throw error;
  }
}

test('host does not import optional plugin internals', () => {
  const result = rg([
    '-n',
    "from '@true-north/plugin-(growth|expense|purchase|library)/(main|renderer|manifest)'",
    'apps/desktop/src',
    '--glob',
    '!**/plugin/catalog.ts',
  ]);
  assert.equal(result.trim(), '');
});

test('host catalog is the only importer of plugin runtime entries', () => {
  const result = rg([
    '-n',
    "from '@true-north/plugin-(growth|expense|purchase|library)/(main|renderer|manifest)'",
    'apps/desktop/src',
  ]);
  const lines = result
    .trim()
    .split('\n')
    .filter(Boolean)
    .filter(
      (line) =>
        !line.includes('src/plugin/catalog.ts') &&
        !line.includes('src/render/plugin/catalog.ts'),
    );
  assert.deepEqual(lines, []);
});

test('public plugin-sdk protocol does not expose EntityManager', () => {
  const result = rg(['-n', 'EntityManager', 'packages/plugin-sdk/src', '--glob', '!**/host/**']);
  const lines = result
    .trim()
    .split('\n')
    .filter(Boolean)
    .filter((line) => !line.includes('Does not expose TypeORM EntityManager'));
  assert.deepEqual(lines, []);
});

test('migrated domain copies are not kept in the desktop host', () => {
  const leftoverRoots = [
    'apps/desktop/src/service/growth',
    'apps/desktop/src/service/expense',
    'apps/desktop/src/service/purchase',
    'apps/desktop/src/service/library',
    'apps/desktop/src/render/features/growth',
    'apps/desktop/src/render/features/expense',
    'apps/desktop/src/render/features/purchase',
    'apps/desktop/src/render/features/library',
  ];
  const existing = leftoverRoots.filter((rel) => existsSync(join(repoRoot, rel)));
  assert.deepEqual(existing, []);
});

test('host database no longer registers plugin entities', () => {
  const broker = readFileSync(join(repoRoot, 'apps/desktop/src/plugin/storage-broker.ts'), 'utf8');
  const registry = readFileSync(join(repoRoot, 'apps/desktop/src/plugin/registry.ts'), 'utf8');
  assert.match(broker, /resolvePluginSpace/);
  assert.doesNotMatch(broker, /pluginEntities/);
  assert.doesNotMatch(registry, /bindSharedPluginStorage/);
  assert.doesNotMatch(registry, /runPluginMigrations/);
});

test('host services do not import plugin entity modules', () => {
  const result = rg([
    '-n',
    "from '@true-north/plugin-(growth|expense|purchase|library)",
    'apps/desktop/src/service',
  ]);
  assert.equal(result.trim(), '');
});

test('AI session, Workbench, and Activity live on the host, not as plugins', () => {
  assert.equal(existsSync(join(repoRoot, 'apps/desktop/src/service/ai')), true);
  assert.equal(existsSync(join(repoRoot, 'apps/desktop/src/render/features/ai')), true);
  assert.equal(existsSync(join(repoRoot, 'apps/desktop/src/render/features/workbench')), true);
  assert.equal(existsSync(join(repoRoot, 'apps/desktop/src/service/activity')), true);
  assert.equal(existsSync(join(repoRoot, 'packages/plugins/ai')), false);
  assert.equal(existsSync(join(repoRoot, 'packages/plugins/workbench')), false);
  assert.equal(existsSync(join(repoRoot, 'packages/plugins/activity')), false);
});
