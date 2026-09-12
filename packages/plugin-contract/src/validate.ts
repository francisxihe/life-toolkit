import { PLUGIN_API_VERSION, namespacedId } from './ids.ts';
import type { PluginManifest } from './manifest.ts';
import { contributionKey } from './manifest.ts';

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
    | 'duplicate-action'
    | 'duplicate-capture'
    | 'duplicate-today'
    | 'duplicate-slot'
    | 'reconcile';
  message: string;
  pluginId?: string;
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

export function validateManifests(manifests: PluginManifest[]): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
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
  }

  const enabledIds = new Set(manifests.map((item) => item.pluginId));
  for (const manifest of manifests) {
    for (const dep of manifest.dependencies || []) {
      if (!enabledIds.has(dep)) {
        issues.push({
          code: 'missing-dependency',
          pluginId: manifest.pluginId,
          message: `Plugin ${manifest.pluginId} depends on missing ${dep}`,
        });
      }
    }
  }

  const { cycles, order } = topoSort(manifests);
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
  const actions = new Map<string, string>();
  const captures = new Map<string, string>();
  const today = new Map<string, string>();
  const slots = new Map<string, string>();

  function claim(
    map: Map<string, string>,
    key: string | undefined,
    pluginId: string,
    code: CatalogIssue['code'],
    label: string,
  ) {
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

  for (const manifest of manifests) {
    const contrib = manifest.contributions;
    for (const [id, ipc] of Object.entries(contrib.ipc || {})) {
      claim(controllers, ipc.routePrefix, manifest.pluginId, 'duplicate-controller', 'controller route');
      void id;
    }
    for (const [id, tool] of Object.entries(contrib.ai?.tools || {})) {
      claim(tools, tool.name || id, manifest.pluginId, 'duplicate-tool', 'tool');
    }
    for (const [id, cap] of Object.entries(contrib.ai?.capabilities || {})) {
      claim(
        capabilities,
        contributionKey(manifest.pluginId, id, cap.key),
        manifest.pluginId,
        'duplicate-capability',
        'capability',
      );
    }
    for (const [id, workspace] of Object.entries(contrib.workbench?.workspaces || {})) {
      claim(
        workspaces,
        contributionKey(manifest.pluginId, id, workspace.key),
        manifest.pluginId,
        'duplicate-workspace',
        'workspace key',
      );
    }
    for (const [id, action] of Object.entries(contrib.workbench?.actions || {})) {
      claim(
        actions,
        contributionKey(manifest.pluginId, id, action.id),
        manifest.pluginId,
        'duplicate-action',
        'workbench action',
      );
    }
    for (const entityType of contrib.storage?.entityTypes || []) {
      claim(entityTypes, namespacedId(manifest.pluginId, entityType), manifest.pluginId, 'duplicate-entity-type', 'entity type');
    }
    for (const entityType of contrib.ai?.entityTypes || []) {
      claim(entityTypes, namespacedId(manifest.pluginId, entityType), manifest.pluginId, 'duplicate-entity-type', 'entity type');
    }
    for (const entityType of contrib.activity?.entityTypes || []) {
      claim(entityTypes, namespacedId(manifest.pluginId, entityType), manifest.pluginId, 'duplicate-entity-type', 'entity type');
    }
    for (const [id, capture] of Object.entries(contrib.activity?.captureTypes || {})) {
      claim(
        captures,
        contributionKey(manifest.pluginId, id, capture.type),
        manifest.pluginId,
        'duplicate-capture',
        'capture type',
      );
    }
    for (const id of Object.keys(contrib.activity?.today || {})) {
      claim(today, namespacedId(manifest.pluginId, id), manifest.pluginId, 'duplicate-today', 'today section');
    }
    for (const [id, slot] of Object.entries(contrib.shell?.slots || {})) {
      claim(slots, `${slot.slot}:${id}`, manifest.pluginId, 'duplicate-slot', 'shell slot');
    }
  }

  void order;
  return issues;
}

export function activationOrder(manifests: PluginManifest[]): string[] {
  return topoSort(manifests).order;
}

export function disposeOrder(manifests: PluginManifest[]): string[] {
  return [...activationOrder(manifests)].reverse();
}
