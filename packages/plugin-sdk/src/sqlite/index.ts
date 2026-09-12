export {
  openPluginSqliteStore,
  closePluginSqliteStore,
  applyPluginMigrations,
  importLegacySqliteTables,
  createRepositoryQueryPort,
} from '../host/plugin-sqlite.ts';
export type { OpenPluginSqliteStoreOptions, PluginMigration, QuerySource } from '../host/plugin-sqlite.ts';
export type { PluginStorageHandle, HostStorageRuntime } from '../host/storage-runtime.ts';
export { asPluginStorageHandle } from '../host/storage-runtime.ts';
export { PluginSchemaLedger } from '../host/schema-ledger.entity.ts';
export { ensureEntitySchema } from '../host/ensure-schema.ts';
