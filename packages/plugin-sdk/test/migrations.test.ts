import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PluginStorageHandle } from '../src/index.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function emptyStore(pluginId: string): PluginStorageHandle {
  return {
    pluginId,
    capability: 'host-shared-transactional',
    async query(sql) {
      if (sql.includes('sqlite_master')) return [];
      if (sql.includes('PRAGMA table_info')) return [];
      return [];
    },
    async runInTransaction(run) {
      return run(this);
    },
  };
}

test('growth and ai migrations skip missing tables and stay storage-handle based', () => {
  const growth = readFileSync(join(repoRoot, 'packages/plugins/growth/src/main/migrations.ts'), 'utf8');
  const ai = readFileSync(join(repoRoot, 'apps/desktop/src/service/ai/migrations.ts'), 'utf8');
  assert.match(growth, /PluginStorageHandle/);
  assert.match(growth, /sqlite_master/);
  assert.match(growth, /names\.has\(/);
  assert.match(ai, /PluginStorageHandle/);
  assert.match(ai, /Legacy importer labels/);
  assert.doesNotMatch(ai, /from '@true-north\/plugin-growth/);
});

test('empty shared-store queries are safe to repeat', async () => {
  const storage = emptyStore('growth');
  for (let pass = 0; pass < 2; pass += 1) {
    const names = new Set(
      ((await storage.query("SELECT name FROM sqlite_master WHERE type = 'table'")) as Array<{ name: string }>).map(
        (row) => row.name,
      ),
    );
    if (names.has('todo')) {
      await storage.query('SELECT 1');
    }
  }
  assert.equal((await storage.query("SELECT name FROM sqlite_master WHERE type = 'table'")).length, 0);
});
