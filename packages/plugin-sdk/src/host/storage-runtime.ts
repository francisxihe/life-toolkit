import type { DataSource, EntityManager, EntityTarget, ObjectLiteral, Repository, TreeRepository } from 'typeorm';
import type { HostStorageCapability, PluginStorageHandle } from '../storage-protocol.ts';

export type HostStorageRuntime = {
  capability: HostStorageCapability;
  dataSource: DataSource;
  manager: EntityManager;
  query(sql: string, params?: unknown[]): Promise<unknown>;
  getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T>;
  getTreeRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): TreeRepository<T>;
  runInTransaction<T>(run: (tx: HostStorageRuntime) => Promise<T>): Promise<T>;
};

const stores = new Map<string, HostStorageRuntime>();

export function storeIdsForDataSource(dataSource: DataSource): string[] {
  return [...stores.entries()]
    .filter(([, runtime]) => runtime.dataSource === dataSource)
    .map(([id]) => id);
}

export function createHostStorageRuntime(
  dataSource: DataSource,
  manager?: EntityManager,
  options?: { capability?: HostStorageCapability },
): HostStorageRuntime {
  const capability = options?.capability ?? 'host-shared-transactional';
  const target = manager ?? dataSource;
  const runtime: HostStorageRuntime = {
    capability,
    dataSource,
    manager: manager ?? dataSource.manager,
    query: (sql, params) => target.query(sql, params as never),
    getRepository: (entity) => target.getRepository(entity),
    getTreeRepository: (entity) => (manager ?? dataSource).getTreeRepository(entity),
    runInTransaction: async (run) => {
      if (manager) return run(runtime);
      return dataSource.transaction(async (tx) => {
        const nested = createHostStorageRuntime(dataSource, tx, { capability });
        const ownedIds = storeIdsForDataSource(dataSource);
        const previous = ownedIds.map((id) => [id, stores.get(id)] as const);
        for (const id of ownedIds) bindPluginStore(id, nested);
        try {
          return await run(nested);
        } finally {
          for (const [id, prev] of previous) {
            if (prev) bindPluginStore(id, prev);
            else unbindPluginStore(id);
          }
        }
      });
    },
  };
  return runtime;
}

export function asPluginStorageHandle(pluginId: string, runtime: HostStorageRuntime): PluginStorageHandle {
  return {
    pluginId,
    capability: runtime.capability,
    query: (sql, params) => runtime.query(sql, params),
    runInTransaction: (run) => runtime.runInTransaction((tx) => run(asPluginStorageHandle(pluginId, tx))),
  };
}

export function bindPluginStore(pluginId: string, runtime: HostStorageRuntime) {
  stores.set(pluginId, runtime);
}

export function pluginStore(pluginId: string): HostStorageRuntime {
  const runtime = stores.get(pluginId);
  if (!runtime) {
    throw new Error(`Storage is not bound for plugin ${pluginId}`);
  }
  return runtime;
}

export function unbindPluginStore(pluginId: string) {
  stores.delete(pluginId);
}
