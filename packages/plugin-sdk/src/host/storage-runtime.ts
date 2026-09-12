import type { DataSource, EntityManager, EntityTarget, ObjectLiteral, Repository, TreeRepository } from 'typeorm';
import type { HostStorageCapability } from '@true-north/plugin-contract';

export type HostStorageRuntime = {
  capability: HostStorageCapability;
  dataSource: DataSource;
  manager: EntityManager;
  query(sql: string, params?: unknown[]): Promise<unknown>;
  getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T>;
  getTreeRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): TreeRepository<T>;
  runInTransaction<T>(run: (tx: HostStorageRuntime) => Promise<T>): Promise<T>;
};

export type PluginStorageHandle = {
  pluginId: string;
  capability: HostStorageCapability;
  query(sql: string, params?: unknown[]): Promise<unknown>;
  runInTransaction<T>(run: (tx: PluginStorageHandle) => Promise<T>): Promise<T>;
};

export class StorageRegistry {
  private readonly stores = new Map<string, HostStorageRuntime>();

  bind(id: string, runtime: HostStorageRuntime) {
    this.stores.set(id, runtime);
  }

  get(id: string): HostStorageRuntime {
    const runtime = this.stores.get(id);
    if (!runtime) throw new Error(`Storage is not bound for ${id}`);
    return runtime;
  }

  unbind(id: string) {
    this.stores.delete(id);
  }

  idsForDataSource(dataSource: DataSource): string[] {
    return [...this.stores.entries()]
      .filter(([, runtime]) => runtime.dataSource === dataSource)
      .map(([id]) => id);
  }
}

export function createHostStorageRuntime(
  dataSource: DataSource,
  manager?: EntityManager,
  options?: { capability?: HostStorageCapability; registry?: StorageRegistry },
): HostStorageRuntime {
  const capability = options?.capability ?? 'self-managed';
  const registry = options?.registry;
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
        const nested = createHostStorageRuntime(dataSource, tx, { capability, registry });
        const ownedIds = registry?.idsForDataSource(dataSource) || [];
        const previous = ownedIds.map((id) => [id, registry?.get(id)] as const);
        for (const id of ownedIds) registry?.bind(id, nested);
        try {
          return await run(nested);
        } finally {
          for (const [id, prev] of previous) {
            if (prev) registry?.bind(id, prev);
            else registry?.unbind(id);
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
