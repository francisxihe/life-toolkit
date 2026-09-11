import {
  assemblePluginCatalog,
  disposeOrder,
  AiPlatformError,
  type PluginCatalog,
  type PluginMainContext,
} from '@true-north/plugin-sdk';
import { firstPartyPluginLoaders } from './catalog';
import {
  createPluginMainContext,
  createHostDataSource,
  runHostAiMigrations,
  closeDatabase,
} from './storage-broker';
import {
  AiController,
  conversationService,
  initializeAiRuntime,
  registerAiContribution,
  startMcpServer,
  stopMcpServer,
} from '../service/ai';
import { entityResolverRegistry } from '../service/ai/entity/entity-resolver.registry';
import {
  ActivityController,
  activityAiContribution,
  activityService,
  bindCaptureAdopters,
  bindTodayContributions,
  getActivityPort,
} from '../service/activity';

let catalog: PluginCatalog | null = null;

export function getMainPluginCatalog(): PluginCatalog {
  if (!catalog) throw new Error('Plugin catalog is not assembled');
  return catalog;
}

function registerQueryResolvers(pluginCatalog: PluginCatalog) {
  for (const plugin of pluginCatalog.plugins) {
    const query = plugin.main?.query;
    if (!query) continue;
    for (const type of plugin.manifest.contributions.ai?.entityTypes || []) {
      entityResolverRegistry.register({
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
}

export async function bootPluginPlatform() {
  const manifestsOnly = await assemblePluginCatalog(firstPartyPluginLoaders, { loadRuntime: false });
  const blocking = manifestsOnly.issues.filter((issue) => issue.code !== 'required-disabled');
  if (blocking.length) {
    throw new Error(blocking.map((issue) => issue.message).join('\n'));
  }

  await createHostDataSource();
  initializeAiRuntime();
  await runHostAiMigrations();

  catalog = await assemblePluginCatalog(firstPartyPluginLoaders, { loadRuntime: true });

  const activityPort: PluginMainContext['activity'] = getActivityPort();
  for (const plugin of catalog.plugins) {
    const ctx = createPluginMainContext(plugin.manifest.pluginId, activityPort);
    await plugin.main?.activate?.(ctx);
  }

  registerAiContribution(activityAiContribution as never);
  for (const plugin of catalog.plugins) {
    if (plugin.main?.ai) registerAiContribution(plugin.main.ai as never);
  }
  registerQueryResolvers(catalog);

  const adopters = catalog.plugins.flatMap((plugin) => plugin.main?.captureAdopters || []);
  const today = catalog.plugins.flatMap((plugin) => (plugin.main?.today ? [plugin.main.today] : []));
  bindCaptureAdopters(adopters);
  bindTodayContributions(today);
  activityService.configureWorkspaceWriter({
    patch: async (messageId, payload, manager) => {
      await conversationService.patchWorkspacePayload(messageId, { payload }, manager);
    },
  });

  return catalog;
}

export async function disposePluginPlatform() {
  if (catalog) {
    for (const pluginId of disposeOrder(catalog)) {
      const plugin = catalog.plugins.find((item) => item.manifest.pluginId === pluginId);
      await plugin?.main?.dispose?.();
    }
  }
  await closeDatabase();
}

export async function startHostMcp() {
  return startMcpServer();
}

export async function stopHostMcp() {
  return stopMcpServer();
}

export function collectIpcControllers() {
  return [
    { id: 'ai', routePrefix: '/ai', controller: AiController },
    { id: 'activity', routePrefix: '/activity', controller: ActivityController },
    ...getMainPluginCatalog().plugins.flatMap((plugin) => plugin.main?.ipcControllers || []),
  ];
}
