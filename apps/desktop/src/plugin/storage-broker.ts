import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  bindPluginStore,
  applyPluginMigrations,
  createHostStorageRuntime,
  ensureEntitySchema,
  PluginSchemaLedger,
  type HostStorageRuntime,
} from '@true-north/plugin-sdk/host';
import type { PluginMainContext, PluginSpace } from '@true-north/plugin-sdk';
import { createSqlLogger } from '../main/dev-trace';
import { User } from '../service/users/user.entity';
import { aiEntities } from '../service/ai/entities';
import { aiMigrations } from '../service/ai/migrations';
import { HOST_AI_STORE_ID } from '../service/ai/storage';
import { activityEntities } from '../service/activity/entities';
import { HOST_ACTIVITY_STORE_ID } from '../service/activity/storage';
import { capabilityRegistry } from '../service/ai/capability/capability.registry';

export function getHostDatabasePath() {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'database.sqlite');
  }
  try {
    const { app } = require('electron') as typeof import('electron');
    return path.join(app.getPath('userData'), 'true-north.db');
  } catch {
    return path.join(process.cwd(), 'true-north.db');
  }
}

function getPluginSpaceRoot(pluginId: string) {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'plugin-data', pluginId);
  }
  try {
    const { app } = require('electron') as typeof import('electron');
    return path.join(app.getPath('userData'), 'plugins', pluginId);
  } catch {
    return path.join(process.cwd(), 'plugin-data', pluginId);
  }
}

export let AppDataSource: DataSource;
let hostRuntime: HostStorageRuntime;

function backupDatabaseOnce(databasePath: string) {
  if (!fs.existsSync(databasePath)) return;
  const backupPath = `${databasePath}.pre-plugin-platform.bak`;
  if (fs.existsSync(backupPath)) return;
  fs.copyFileSync(databasePath, backupPath);
  console.log('已备份数据库', backupPath);
}

export async function createHostDataSource(): Promise<DataSource> {
  const databasePath = getHostDatabasePath();
  backupDatabaseOnce(databasePath);
  const isDev = process.env.NODE_ENV === 'development';
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: databasePath,
    synchronize: false,
    logging: isDev ? ['query', 'error'] : undefined,
    logger: createSqlLogger(),
    maxQueryExecutionTime: isDev ? -1 : undefined,
    entities: [User, PluginSchemaLedger, ...aiEntities, ...activityEntities],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy(),
  });
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await ensureEntitySchema(AppDataSource);
  hostRuntime = createHostStorageRuntime(AppDataSource);
  bindHostAiStorage();
  bindHostActivityStorage();
  return AppDataSource;
}

export function bindHostAiStorage() {
  bindPluginStore(HOST_AI_STORE_ID, hostRuntime);
}

export function bindHostActivityStorage() {
  bindPluginStore(HOST_ACTIVITY_STORE_ID, hostRuntime);
}

export function resolvePluginSpace(pluginId: string): PluginSpace {
  const rootDir = getPluginSpaceRoot(pluginId);
  fs.mkdirSync(rootDir, { recursive: true });
  const legacyPath = getHostDatabasePath();
  return {
    pluginId,
    rootDir,
    legacySharedDbPath: fs.existsSync(legacyPath) ? legacyPath : undefined,
  };
}

export function createPluginMainContext(pluginId: string, activityPort: PluginMainContext['activity']): PluginMainContext {
  return {
    pluginId,
    space: resolvePluginSpace(pluginId),
    activity: activityPort,
    getCapability: (key) => capabilityRegistry.get(key),
  };
}

export async function runHostAiMigrations() {
  await applyPluginMigrations(HOST_AI_STORE_ID, aiMigrations);
}

export async function closeDatabase() {
  if (AppDataSource?.isInitialized) {
    await AppDataSource.destroy();
  }
}
