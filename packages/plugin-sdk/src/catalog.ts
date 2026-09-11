import { isRequiredPluginId, PLUGIN_API_VERSION } from './ids.ts';
import type { PluginManifest } from './manifest.ts';
import { parsePluginManifest } from './manifest.ts';
import type { PluginMainContribution, PluginModuleLoader, PluginRendererContribution } from './contributions.ts';

export type CatalogIssue = {
  code:
    | 'api-version'
    | 'missing-dependency'
    | 'cycle'
    | 'duplicate-plugin'
    | 'duplicate-controller'
    | 'duplicate-tool'
    | 'duplicate-workspace'
    | 'duplicate-entity-type'
    | 'duplicate-capability'
    | 'required-disabled';
  message: string;
  pluginId?: string;
};

export type AssembledPlugin = {
  manifest: PluginManifest;
  main?: PluginMainContribution;
  renderer?: PluginRendererContribution;
};

export type PluginCatalog = {
  plugins: AssembledPlugin[];
  order: string[];
  issues: CatalogIssue[];
};

export type AssembleCatalogOptions = {
  disabledPluginIds?: string[];
  loadRuntime?: boolean;
};

function topoSort(manifests: PluginManifest[]): { order: string[]; cycles: string[][] } {
  const byId = new Map(manifests.map((item) => [item.pluginId, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const order: string[] = [];
  const cycles: string[][] = [];

  function visit(id: string, stack: string[]) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      cycles.push(stack.slice(start >= 0 ? start : 0).concat(id));
      return;
    }
    visiting.add(id);
    const deps = byId.get(id)?.dependencies || [];
    for (const dep of deps) {
      if (byId.has(dep)) visit(dep, [...stack, id]);
    }
    visiting.delete(id);
    visited.add(id);
    order.push(id);
  }

  for (const manifest of manifests) visit(manifest.pluginId, []);
  return { order, cycles };
}

export function validateManifests(
  manifests: PluginManifest[],
  options: AssembleCatalogOptions = {},
): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const disabled = new Set(options.disabledPluginIds || []);
  const ids = new Set<string>();

  for (const manifest of manifests) {
    if (ids.has(manifest.pluginId)) {
      issues.push({
        code: 'duplicate-plugin',
        pluginId: manifest.pluginId,
        message: `Duplicate pluginId ${manifest.pluginId}`,
      });
    }
    ids.add(manifest.pluginId);
    if (manifest.apiVersion !== PLUGIN_API_VERSION) {
      issues.push({
        code: 'api-version',
        pluginId: manifest.pluginId,
        message: `Plugin ${manifest.pluginId} apiVersion ${manifest.apiVersion} does not match host ${PLUGIN_API_VERSION}`,
      });
    }
    const required = manifest.required || isRequiredPluginId(manifest.pluginId);
    if (required && disabled.has(manifest.pluginId)) {
      issues.push({
        code: 'required-disabled',
        pluginId: manifest.pluginId,
        message: `Required plugin ${manifest.pluginId} cannot be disabled`,
      });
    }
  }

  const enabled = manifests.filter((item) => !disabled.has(item.pluginId) || item.required || isRequiredPluginId(item.pluginId));
  const enabledIds = new Set(enabled.map((item) => item.pluginId));

  for (const manifest of enabled) {
    for (const dep of manifest.dependencies || []) {
      if (!enabledIds.has(dep)) {
        issues.push({
          code: 'missing-dependency',
          pluginId: manifest.pluginId,
          message: `Plugin ${manifest.pluginId} depends on missing or disabled ${dep}`,
        });
      }
    }
  }

  const { cycles } = topoSort(enabled);
  for (const cycle of cycles) {
    issues.push({
      code: 'cycle',
      message: `Plugin dependency cycle: ${cycle.join(' -> ')}`,
      pluginId: cycle[0],
    });
  }

  const controllers = new Map<string, string>();
  const tools = new Map<string, string>();
  const workspaces = new Map<string, string>();
  const entityTypes = new Map<string, string>();
  const capabilities = new Map<string, string>();

  function claim(map: Map<string, string>, key: string | undefined, pluginId: string, code: CatalogIssue['code'], label: string) {
    if (!key) return;
    const existing = map.get(key);
    if (existing) {
      if (existing === pluginId) return;
      issues.push({
        code,
        pluginId,
        message: `Duplicate ${label} "${key}" from ${existing} and ${pluginId}`,
      });
      return;
    }
    map.set(key, pluginId);
  }

  for (const manifest of enabled) {
    for (const ipc of manifest.contributions.ipc || []) {
      claim(controllers, ipc.routePrefix, manifest.pluginId, 'duplicate-controller', 'controller route');
    }
    for (const tool of manifest.contributions.ai?.toolNames || []) {
      claim(tools, tool, manifest.pluginId, 'duplicate-tool', 'tool');
    }
    for (const key of manifest.contributions.ai?.capabilityKeys || []) {
      claim(capabilities, key, manifest.pluginId, 'duplicate-capability', 'capability');
    }
    for (const key of manifest.contributions.workbench?.workspaceKeys || []) {
      claim(workspaces, key, manifest.pluginId, 'duplicate-workspace', 'workspace key');
    }
    for (const entityType of manifest.contributions.storage?.entityTypes || []) {
      claim(entityTypes, `${manifest.pluginId}:${entityType}`, manifest.pluginId, 'duplicate-entity-type', 'entity type');
    }
    for (const entityType of manifest.contributions.ai?.entityTypes || []) {
      claim(entityTypes, entityType, manifest.pluginId, 'duplicate-entity-type', 'entity type');
    }
    for (const entityType of manifest.contributions.activity?.entityTypes || []) {
      claim(entityTypes, `${manifest.pluginId}:${entityType}`, manifest.pluginId, 'duplicate-entity-type', 'entity type');
    }
  }

  return issues;
}

async function resolveMain(loader: PluginModuleLoader): Promise<PluginMainContribution | undefined> {
  if (!loader.loadMain) return undefined;
  const loaded = await loader.loadMain();
  if (typeof (loaded as { createMain?: unknown }).createMain === 'function') {
    return await (loaded as { createMain: () => PluginMainContribution | Promise<PluginMainContribution> }).createMain();
  }
  return loaded as PluginMainContribution;
}

async function resolveRenderer(loader: PluginModuleLoader): Promise<PluginRendererContribution | undefined> {
  if (!loader.loadRenderer) return undefined;
  const loaded = await loader.loadRenderer();
  if (typeof (loaded as { createRenderer?: unknown }).createRenderer === 'function') {
    return (loaded as { createRenderer: () => PluginRendererContribution }).createRenderer();
  }
  return loaded as PluginRendererContribution;
}

export async function assemblePluginCatalog(
  loaders: PluginModuleLoader[],
  options: AssembleCatalogOptions = {},
): Promise<PluginCatalog> {
  const manifests = loaders.map((loader) => parsePluginManifest(loader.manifest));
  const issues = validateManifests(manifests, options);
  const disabled = new Set(options.disabledPluginIds || []);
  const blocking = issues.filter((issue) => issue.code !== 'required-disabled' || disabled.size > 0);
  const enabledLoaders = loaders.filter((loader) => {
    const required = loader.manifest.required || isRequiredPluginId(loader.manifest.pluginId);
    if (required) return true;
    return !disabled.has(loader.manifest.pluginId);
  });
  const { order } = topoSort(enabledLoaders.map((loader) => loader.manifest));
  const plugins: AssembledPlugin[] = [];

  if (options.loadRuntime === false) {
    return {
      plugins: enabledLoaders.map((loader) => ({ manifest: parsePluginManifest(loader.manifest) })),
      order,
      issues: blocking,
    };
  }

  for (const pluginId of order) {
    const loader = enabledLoaders.find((item) => item.manifest.pluginId === pluginId);
    if (!loader) continue;
    plugins.push({
      manifest: parsePluginManifest(loader.manifest),
      main: await resolveMain(loader),
      renderer: await resolveRenderer(loader),
    });
  }

  return { plugins, order, issues: blocking };
}

export function activationOrder(catalog: PluginCatalog): string[] {
  return catalog.order;
}

export function disposeOrder(catalog: PluginCatalog): string[] {
  return [...catalog.order].reverse();
}
