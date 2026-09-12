import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  assemblePluginCatalog,
  disposeOrder,
  reconcileMain,
  AiPlatformError,
  type PluginCatalog,
  type PluginMainContext,
  type PluginMainHandles,
  type PluginMainModule,
} from '@true-north/plugin-sdk';
import {
  StorageRegistry,
  applyPluginMigrations,
  createHostStorageRuntime,
  ensureEntitySchema,
  PluginSchemaLedger,
  type HostStorageRuntime,
} from '@true-north/plugin-sdk/main';
import { createSqlLogger } from '../main/dev-trace';
import { User } from '../service/users/user.entity';
import { aiEntities } from '../service/ai/entities';
import { aiMigrations } from '../service/ai/migrations';
import { activityEntities } from '../service/activity/entities';
import { ActivityLink } from '../service/activity/activity-link.entity';
import { ActivityController, activityAiContribution, activityService } from '../service/activity';
import { CapabilityRegistry } from '../service/ai/capability/capability.registry';
import { AgentToolRegistry } from '../service/ai/agent/tools';
import { EntityResolverRegistry } from '../service/ai/entity/entity-resolver.registry';
import { cacheService, fingerprintPromptContext } from '../service/ai/cache/ai-suggestion-cache.service';
import { addAgentInstructions } from '../service/ai/runtime/agent-instructions';
import { attachAiRegistries } from '../service/ai/contribution';
import { runtimeService } from '../service/ai/runtime';
import { AiController, conversationService, startMcpServer, stopMcpServer } from '../service/ai';
import { firstPartyMainDescriptors } from './main-loaders';
import { HOST_ACTIVITY_STORE_ID, HOST_AI_STORE_ID } from './host-ids';
import { getPluginHost, getPluginHostOptional, setActiveHost } from './active-host';

const LEGACY_DOMAIN_TO_REF: Record<string, { pluginId: string; entityType: string }> = {
  todo: { pluginId: 'growth', entityType: 'todo' },
  habit: { pluginId: 'growth', entityType: 'habit' },
  task: { pluginId: 'growth', entityType: 'task' },
  goal: { pluginId: 'growth', entityType: 'goal' },
  focus: { pluginId: 'growth', entityType: 'track-time' },
  expense: { pluginId: 'expense', entityType: 'transaction' },
  purchase: { pluginId: 'purchase', entityType: 'purchase' },
  bookmark: { pluginId: 'library', entityType: 'bookmark' },
};

type ActivatedPlugin = {
  pluginId: string;
  module: PluginMainModule;
  handles: PluginMainHandles;
};

export class DesktopPluginHost {
  readonly storage = new StorageRegistry();
  readonly capabilities = new CapabilityRegistry();
  readonly agentTools = new AgentToolRegistry();
  readonly entityResolvers = new EntityResolverRegistry();

  catalog: PluginCatalog | null = null;
  dataSource: DataSource | null = null;
  private hostRuntime: HostStorageRuntime | null = null;
  private activated: ActivatedPlugin[] = [];
  private published = false;

  getHostDatabasePath() {
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

  resolvePluginSpace(pluginId: string) {
    const rootDir = this.getPluginSpaceRoot(pluginId);
    fs.mkdirSync(rootDir, { recursive: true });
    const legacyPath = this.getHostDatabasePath();
    return {
      pluginId,
      rootDir,
      legacySharedDbPath: fs.existsSync(legacyPath) ? legacyPath : undefined,
    };
  }

  private getPluginSpaceRoot(pluginId: string) {
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

  createPluginMainContext(pluginId: string): PluginMainContext {
    return {
      pluginId,
      space: this.resolvePluginSpace(pluginId),
      activity: {
        record: async (input) => {
          await activityService.create({
            title: input.title,
            summary: input.summary,
            source: input.source as never,
            occurredAt: input.occurredAt,
            captureMessageId: input.captureMessageId,
            links: input.links.map((link) => ({
              pluginId: link.pluginId,
              entityType: link.entityType,
              entityId: link.entityId,
              role: link.role,
              label: link.label,
            })),
          });
        },
        unlink: async (ref) => {
          await activityService.unlinkRef(ref);
        },
      },
      ai: {
        getCapability: (key) => this.capabilities.get(key),
        cache: {
          fingerprintPromptContext,
          findMatching: (input) => cacheService.findMatching(input),
          upsert: (input) => cacheService.upsert(input),
        },
      },
    };
  }

  private backupDatabaseOnce(databasePath: string) {
    if (!fs.existsSync(databasePath)) return;
    const backupPath = `${databasePath}.pre-plugin-platform.bak`;
    if (fs.existsSync(backupPath)) return;
    fs.copyFileSync(databasePath, backupPath);
    console.log('已备份数据库', backupPath);
  }

  async openHostDatabase() {
    const databasePath = this.getHostDatabasePath();
    this.backupDatabaseOnce(databasePath);
    const isDev = process.env.NODE_ENV === 'development';
    const dataSource = new DataSource({
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
    if (!dataSource.isInitialized) await dataSource.initialize();
    await ensureEntitySchema(dataSource);
    this.dataSource = dataSource;
    this.hostRuntime = createHostStorageRuntime(dataSource, undefined, { registry: this.storage });
    this.storage.bind(HOST_AI_STORE_ID, this.hostRuntime);
    this.storage.bind(HOST_ACTIVITY_STORE_ID, this.hostRuntime);
    await applyPluginMigrations(this.hostRuntime, HOST_AI_STORE_ID, aiMigrations);
    await this.migrateActivityLegacyRefs();
  }

  async migrateActivityLegacyRefs() {
    if (!this.hostRuntime) return;
    const repo = this.hostRuntime.getRepository(ActivityLink);
    const links = await repo.find();
    for (const link of links) {
      if (link.pluginId && link.entityType) continue;
      const mapped = LEGACY_DOMAIN_TO_REF[String(link.domain)];
      if (!mapped) continue;
      link.pluginId = mapped.pluginId;
      link.entityType = mapped.entityType;
      await repo.save(link);
    }
  }

  private throwIfIssues(issues: CatalogIssueLike[]) {
    if (!issues.length) return;
    throw new Error(issues.map((issue) => issue.message).join('\n'));
  }

  async boot() {
    const descriptors = firstPartyMainDescriptors();
    const assembled = await assemblePluginCatalog(descriptors, { side: 'main' });
    this.throwIfIssues(assembled.issues);

    await this.openHostDatabase();

    const pending: ActivatedPlugin[] = [];
    try {
      for (const plugin of assembled.plugins) {
        if (!plugin.main) {
          throw new Error(`Plugin ${plugin.manifest.pluginId} has no main implementation`);
        }
        const handles = await plugin.main.activate(this.createPluginMainContext(plugin.manifest.pluginId));
        const issues = reconcileMain(plugin.manifest, handles);
        this.throwIfIssues(issues);
        pending.push({ pluginId: plugin.manifest.pluginId, module: plugin.main, handles });
      }
    } catch (error) {
      for (const item of [...pending].reverse()) {
        await item.module.dispose?.();
      }
      await this.closeDatabase();
      throw error;
    }

    this.activated = pending;
    this.catalog = assembled;
    this.publish();
    return assembled;
  }

  private publish() {
    attachAiRegistries({
      agentTools: this.agentTools,
      entityResolvers: this.entityResolvers,
    });
    this.registerAiContribution(activityAiContribution as never);
    for (const item of this.activated) {
      if (item.handles.ai) this.registerAiContribution(item.handles.ai as never);
      const query = item.handles.query;
      if (!query) continue;
      const plugin = this.catalog?.plugins.find((entry) => entry.manifest.pluginId === item.pluginId);
      for (const type of plugin?.manifest.contributions.ai?.entityTypes || []) {
        this.entityResolvers.register({
          type,
          async resolve(id: string) {
            const record = await query.get(type, id);
            if (!record) {
              throw AiPlatformError.contextNotFound(`${type} 不存在或已删除: ${id}`);
            }
            return { type: record.entityType, id: record.id, name: record.label };
          },
        });
      }
    }
    activityService.configureCaptureAdopters(this.activated.flatMap((item) => item.handles.captureAdopters || []));
    activityService.configureToday(this.activated.flatMap((item) => item.handles.todaySections || []));
    activityService.configureWorkspaceWriter({
      patch: async (messageId, payload, manager) => {
        await conversationService.patchWorkspacePayload(messageId, { payload }, manager);
      },
    });
    this.published = true;
  }

  registerAiContribution(contribution: {
    capabilities?: Array<{ key: string; execute(input: never): Promise<unknown> }>;
    tools?: Parameters<AgentToolRegistry['register']>[0];
    entityResolvers?: Array<{ type: string; resolve(id: string): Promise<{ type: string; id: string; name: string }> }>;
    agentInstructions?: string;
  }) {
    for (const capability of contribution.capabilities || []) {
      this.capabilities.register(capability);
    }
    if (contribution.tools?.length) this.agentTools.register(contribution.tools);
    for (const resolver of contribution.entityResolvers || []) {
      this.entityResolvers.register(resolver);
    }
    if (contribution.agentInstructions?.trim()) {
      addAgentInstructions(contribution.agentInstructions.trim());
    }
  }

  collectIpcControllers() {
    if (!this.published || !this.catalog) {
      throw new Error('Plugin host has not published IPC handles');
    }
    return [
      { id: 'ai', routePrefix: '/ai', controller: new AiController(conversationService, runtimeService, this.capabilities) },
      { id: 'activity', routePrefix: '/activity', controller: new ActivityController() },
      ...this.activated.flatMap((item) =>
        Object.entries(item.handles.ipcControllers || {}).map(([id, spec]) => ({
          id: `${item.pluginId}:${id}`,
          routePrefix: this.catalog!.plugins.find((plugin) => plugin.manifest.pluginId === item.pluginId)?.manifest
            .contributions.ipc?.[id]?.routePrefix || `/${id}`,
          controller: spec.controller,
        })),
      ),
    ];
  }

  async dispose() {
    const order = this.catalog ? disposeOrder(this.catalog.plugins.map((plugin) => plugin.manifest)) : [];
    for (const pluginId of order) {
      const item = this.activated.find((entry) => entry.pluginId === pluginId);
      await item?.module.dispose?.();
    }
    this.activated = [];
    this.published = false;
    await this.stopMcp();
    await this.closeDatabase();
  }

  async closeDatabase() {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
    this.dataSource = null;
    this.hostRuntime = null;
  }

  async startMcp() {
    return startMcpServer();
  }

  async stopMcp() {
    return stopMcpServer();
  }
}

type CatalogIssueLike = { message: string };

export { getPluginHost } from './active-host';

export async function bootPluginPlatform() {
  const host = new DesktopPluginHost();
  setActiveHost(host);
  try {
    await host.boot();
  } catch (error) {
    setActiveHost(null);
    throw error;
  }
  return host.catalog;
}

export async function disposePluginPlatform() {
  const host = getPluginHostOptional();
  if (!host) return;
  setActiveHost(null);
  await host.dispose();
}

export function collectIpcControllers() {
  return getPluginHost().collectIpcControllers();
}

export async function startHostMcp() {
  return getPluginHost().startMcp();
}

export async function stopHostMcp() {
  return getPluginHost().stopMcp();
}

export function getMainPluginCatalog(): PluginCatalog {
  const catalog = getPluginHost().catalog;
  if (!catalog) throw new Error('Plugin catalog is not assembled');
  return catalog;
}
