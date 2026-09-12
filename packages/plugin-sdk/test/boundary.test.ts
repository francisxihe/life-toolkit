import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const sdkIndex = readFileSync(join(repoRoot, 'packages/plugin-sdk/src/index.ts'), 'utf8');

function rg(args: string[]) {
  try {
    return execFileSync('rg', args, { cwd: repoRoot, encoding: 'utf8' });
  } catch (error) {
    const err = error as { status?: number; stdout?: string };
    if (err.status === 1) return err.stdout || '';
    throw error;
  }
}

test('plugin-contract stays free of host and UI runtime deps', () => {
  const result = rg([
    '-n',
    "from ['\"](react|react-dom|typeorm|electron|@true-north/vo|@true-north/enum)['\"]",
    'packages/plugin-contract/src',
  ]);
  assert.equal(result.trim(), '');
});

test('plugin-sdk root does not export bind or renderer-runtime globals', () => {
  assert.doesNotMatch(sdkIndex, /bindAi/);
  assert.doesNotMatch(sdkIndex, /bindRendererRuntime/);
  assert.doesNotMatch(sdkIndex, /getRendererRuntime/);
  assert.doesNotMatch(sdkIndex, /registerFocusOpener/);
  assert.doesNotMatch(sdkIndex, /registerWorkbenchOpener/);
  assert.doesNotMatch(sdkIndex, /FIRST_PARTY_PLUGIN_IDS/);
  assert.doesNotMatch(sdkIndex, /REQUIRED_PLUGIN_IDS/);
});

test('plugins do not import desktop aliases, host source, or central domain web-service', () => {
  const fromAt = rg([
    '-n',
    "from ['\"]@/",
    'packages/plugins',
    '--glob',
    '!**/activity/**',
    '--glob',
    '!**/*.md',
  ]);
  const desktopSrc = rg(['-n', 'apps/desktop/src', 'packages/plugins', '--glob', '!**/activity/**']);
  const webService = rg([
    '-n',
    "from ['\"]@true-north/web-service",
    'packages/plugins',
    '--glob',
    '!**/activity/**',
  ]);
  assert.equal(fromAt.trim(), '');
  assert.equal(desktopSrc.trim(), '');
  assert.equal(webService.trim(), '');
});

test('host only imports first-party plugins from the registry and loader maps', () => {
  const result = rg([
    '-n',
    "from ['\"]@true-north/plugin-(growth|expense|purchase|library)/",
    'apps/desktop/src',
  ]);
  const lines = result
    .trim()
    .split('\n')
    .filter(Boolean)
    .filter(
      (line) =>
        !line.includes('src/plugin/desktop-plugins.ts') &&
        !line.includes('src/plugin/main-loaders.ts') &&
        !line.includes('src/render/plugin/renderer-loaders.ts'),
    );
  assert.deepEqual(lines, []);
});

test('main process plugin host does not import renderer implementations', () => {
  const result = rg([
    '-n',
    "plugin-(growth|expense|purchase|library)/renderer",
    'apps/desktop/src/main',
    'apps/desktop/src/plugin',
    'apps/desktop/src/service',
  ]);
  assert.equal(result.trim(), '');
});

test('public plugin-sdk protocol does not expose EntityManager', () => {
  const result = rg(['-n', 'EntityManager', 'packages/plugin-sdk/src/index.ts']);
  assert.equal(result.trim(), '');
  const contract = rg(['-n', 'EntityManager', 'packages/plugin-contract/src']);
  assert.equal(contract.trim(), '');
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
    'apps/desktop/src/render/features/mind-map',
    'apps/desktop/src/render/features/timer',
  ];
  const existing = leftoverRoots.filter((rel) => existsSync(join(repoRoot, rel)));
  assert.deepEqual(existing, []);
});

test('host database no longer registers plugin entities', () => {
  const broker = readFileSync(join(repoRoot, 'apps/desktop/src/plugin/storage-broker.ts'), 'utf8');
  const registry = readFileSync(join(repoRoot, 'apps/desktop/src/plugin/registry.ts'), 'utf8');
  const host = readFileSync(join(repoRoot, 'apps/desktop/src/plugin/host.ts'), 'utf8');
  assert.match(broker, /getPluginHost/);
  assert.match(host, /resolvePluginSpace/);
  assert.doesNotMatch(broker, /pluginEntities/);
  assert.doesNotMatch(registry, /bindSharedPluginStorage/);
  assert.doesNotMatch(registry, /runPluginMigrations/);
});

test('host services do not import plugin entity modules', () => {
  const result = rg([
    '-n',
    "from ['\"]@true-north/plugin-(growth|expense|purchase|library)",
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
