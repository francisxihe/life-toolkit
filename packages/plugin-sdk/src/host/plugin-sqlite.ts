import fs from 'fs';
import path from 'path';
import { DataSource, type EntityTarget, type ObjectLiteral } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import type { PluginQueryPort, PluginRecord, PluginSpace, PluginStorageHandle } from '../storage-protocol.ts';
import { PluginSchemaLedger } from './schema-ledger.entity.ts';
import { ensureEntitySchema } from './ensure-schema.ts';
import {
  asPluginStorageHandle,
  bindPluginStore,
  createHostStorageRuntime,
  pluginStore,
  unbindPluginStore,
} from './storage-runtime.ts';

const HOST_LEGACY_TABLES = new Set([
  'user',
  'plugin_schema_ledger',
  'ai_conversation',
  'ai_message',
  'ai_suggestion_cache',
  'activity',
  'activity_link',
  'sqlite_sequence',
]);

export type PluginMigration = {
  id: string;
  version: number;
  up: (storage: PluginStorageHandle) => Promise<void>;
};

export type OpenPluginSqliteStoreOptions = {
  pluginId: string;
  space: PluginSpace;
  entities: Function[];
  migrations?: PluginMigration[];
  extraLegacyTables?: string[];
  dbFileName?: string;
};

function escapeSqlitePath(filePath: string): string {
  return filePath.replace(/'/g, "''");
}

function destTableNames(dataSource: DataSource): string[] {
  const names = new Set<string>();
  for (const meta of dataSource.entityMetadatas) {
    names.add(meta.tableName);
    const closure = (meta as { closureJunctionTable?: { tableName?: string } }).closureJunctionTable?.tableName;
    if (closure) names.add(closure);
    for (const relation of meta.manyToManyRelations || []) {
      const junction = relation.junctionEntityMetadata?.tableName;
      if (junction) names.add(junction);
    }
  }
  return [...names];
}

async function copyTable(dataSource: DataSource, tableName: string) {
  const legacy = (await dataSource.query(
    `SELECT name, sql FROM legacy.sqlite_master WHERE type = 'table' AND name = ?`,
    [tableName],
  )) as Array<{ name: string; sql?: string }>;
  if (!legacy.length) return;

  const dest = (await dataSource.query(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [tableName],
  )) as Array<{ name: string }>;
  if (!dest.length && legacy[0]?.sql) {
    await dataSource.query(legacy[0].sql);
  }

  const destCols = (await dataSource.query(`PRAGMA table_info('${tableName}')`)) as Array<{ name: string }>;
  const srcCols = (await dataSource.query(`PRAGMA legacy.table_info('${tableName}')`)) as Array<{ name: string }>;
  const srcNames = new Set((srcCols || []).map((column) => column.name));
  const cols = (destCols || []).map((column) => column.name).filter((name) => srcNames.has(name));
  if (!cols.length) return;
  const colList = cols.map((name) => `"${name}"`).join(', ');
  await dataSource.query(
    `INSERT OR IGNORE INTO "${tableName}" (${colList}) SELECT ${colList} FROM legacy."${tableName}"`,
  );
}

export async function importLegacySqliteTables(
  dataSource: DataSource,
  legacyPath: string,
  extraTables: string[] = [],
) {
  if (!fs.existsSync(legacyPath)) return;
  await dataSource.query(`ATTACH DATABASE '${escapeSqlitePath(legacyPath)}' AS legacy`);
  try {
    const tables = new Set([...destTableNames(dataSource), ...extraTables]);
    tables.delete('plugin_schema_ledger');
    for (const tableName of tables) {
      if (HOST_LEGACY_TABLES.has(tableName)) continue;
      await copyTable(dataSource, tableName);
    }
  } finally {
    await dataSource.query('DETACH DATABASE legacy');
  }
}

export async function applyPluginMigrations(pluginId: string, migrations: PluginMigration[] = []) {
  const sorted = [...migrations].sort((a, b) => a.version - b.version);
  if (!sorted.length) return;
  const runtime = pluginStore(pluginId);
  const ledgerRepo = runtime.getRepository(PluginSchemaLedger);
  const current = await ledgerRepo.findOne({ where: { pluginId } });
  let version = current?.version ?? 0;
  const storage = asPluginStorageHandle(pluginId, runtime);
  for (const migration of sorted) {
    if (migration.version <= version) continue;
    await migration.up(storage);
    version = migration.version;
    await ledgerRepo.save({
      pluginId,
      version,
      appliedAt: new Date(),
    });
  }
}

export async function openPluginSqliteStore(options: OpenPluginSqliteStoreOptions) {
  const dbFileName = options.dbFileName || 'store.sqlite';
  const dbPath = path.join(options.space.rootDir, dbFileName);
  fs.mkdirSync(options.space.rootDir, { recursive: true });
  const existed = fs.existsSync(dbPath);
  const isDev = process.env.NODE_ENV === 'development';
  const dataSource = new DataSource({
    type: 'sqlite',
    database: dbPath,
    synchronize: false,
    logging: isDev ? ['error'] : undefined,
    entities: [...options.entities, PluginSchemaLedger] as Function[],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy(),
  });
  await dataSource.initialize();
  await ensureEntitySchema(dataSource);
  if (!existed && options.space.legacySharedDbPath) {
    await importLegacySqliteTables(dataSource, options.space.legacySharedDbPath, options.extraLegacyTables);
  }
  const runtime = createHostStorageRuntime(dataSource, undefined, { capability: 'self-managed' });
  bindPluginStore(options.pluginId, runtime);
  await applyPluginMigrations(options.pluginId, options.migrations);
  return runtime;
}

export async function closePluginSqliteStore(pluginId: string) {
  let runtime: ReturnType<typeof pluginStore> | undefined;
  try {
    runtime = pluginStore(pluginId);
  } catch {
    return;
  }
  if (runtime.dataSource.isInitialized) {
    await runtime.dataSource.destroy();
  }
  unbindPluginStore(pluginId);
}

export type QuerySource<T extends ObjectLiteral = ObjectLiteral> = {
  entityType: string;
  entity: EntityTarget<T>;
  label: (row: T) => string;
};

export function createRepositoryQueryPort(pluginId: string, sources: QuerySource[]): PluginQueryPort {
  const byType = new Map(sources.map((source) => [source.entityType, source]));

  function toRecord(source: QuerySource, row: ObjectLiteral): PluginRecord {
    return {
      pluginId,
      entityType: source.entityType,
      id: String(row.id),
      label: source.label(row) || String(row.id),
    };
  }

  return {
    async get(entityType, id) {
      const source = byType.get(entityType);
      if (!source) return null;
      const row = await pluginStore(pluginId).getRepository(source.entity).findOne({ where: { id } as never });
      return row ? toRecord(source, row) : null;
    },
    async list(query) {
      const source = byType.get(query.entityType);
      if (!source) return [];
      const rows = await pluginStore(pluginId).getRepository(source.entity).find();
      const needle = query.q?.trim().toLowerCase();
      const matched = needle
        ? rows.filter((row) => toRecord(source, row).label.toLowerCase().includes(needle))
        : rows;
      const limited = query.limit != null ? matched.slice(0, query.limit) : matched;
      return limited.map((row) => toRecord(source, row));
    },
  };
}
