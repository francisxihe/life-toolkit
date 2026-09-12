import { contributionKey, namespacedId, type CatalogIssue, type PluginManifest } from '@true-north/plugin-contract';
import type { PluginMainHandles, PluginRendererHandles } from './runtime.ts';

function asSet(values: Array<string | undefined>): Set<string> {
  return new Set(values.filter((value): value is string => Boolean(value)));
}

function equalSets(expected: Set<string>, actual: Set<string>, pluginId: string, label: string): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  for (const key of expected) {
    if (!actual.has(key)) {
      issues.push({
        code: 'reconcile',
        pluginId,
        message: `Plugin ${pluginId} declared ${label} "${key}" but did not implement it`,
      });
    }
  }
  for (const key of actual) {
    if (!expected.has(key)) {
      issues.push({
        code: 'reconcile',
        pluginId,
        message: `Plugin ${pluginId} implemented undeclared ${label} "${key}"`,
      });
    }
  }
  return issues;
}

function controllerPrefix(controller: object): string | undefined {
  const ctor = (controller as { constructor?: object }).constructor || controller;
  const path = Reflect.getMetadata?.('controller:path', ctor);
  return typeof path === 'string' ? path : undefined;
}

export function reconcileMain(manifest: PluginManifest, handles: PluginMainHandles | undefined): CatalogIssue[] {
  if (!handles) {
    return manifest.contributions.ipc || manifest.contributions.ai || manifest.contributions.activity || manifest.contributions.storage
      ? [{ code: 'reconcile', pluginId: manifest.pluginId, message: `Plugin ${manifest.pluginId} has no main implementation` }]
      : [];
  }
  const issues: CatalogIssue[] = [];
  const declaredIpc = Object.entries(manifest.contributions.ipc || {});
  const implementedIpc = Object.entries(handles.ipcControllers || {});
  issues.push(
    ...equalSets(
      asSet(declaredIpc.map(([id]) => id)),
      asSet(implementedIpc.map(([id]) => id)),
      manifest.pluginId,
      'ipc controller',
    ),
  );
  for (const [id, spec] of declaredIpc) {
    const implemented = handles.ipcControllers?.[id];
    if (!implemented) continue;
    const prefix = controllerPrefix(implemented.controller);
    if (prefix && prefix !== spec.routePrefix) {
      issues.push({
        code: 'reconcile',
        pluginId: manifest.pluginId,
        message: `Plugin ${manifest.pluginId} ipc "${id}" routePrefix ${spec.routePrefix} does not match controller ${prefix}`,
      });
    }
  }

  const declaredCaps = Object.entries(manifest.contributions.ai?.capabilities || {}).map(([id, spec]) =>
    contributionKey(manifest.pluginId, id, spec.key),
  );
  const actualCaps = (handles.ai?.capabilities || []).map((item) => item.key);
  issues.push(...equalSets(asSet(declaredCaps), asSet(actualCaps), manifest.pluginId, 'capability'));

  const declaredTools = Object.entries(manifest.contributions.ai?.tools || {}).map(([id, spec]) => spec.name || id);
  const actualTools = (handles.ai?.tools || []).map((item) => item.name);
  issues.push(...equalSets(asSet(declaredTools), asSet(actualTools), manifest.pluginId, 'tool'));

  const declaredCaptures = Object.entries(manifest.contributions.activity?.captureTypes || {}).map(([id, spec]) =>
    contributionKey(manifest.pluginId, id, spec.type),
  );
  const actualCaptures = (handles.captureAdopters || []).map((item) => item.type);
  issues.push(...equalSets(asSet(declaredCaptures), asSet(actualCaptures), manifest.pluginId, 'capture type'));

  const declaredToday = Object.keys(manifest.contributions.activity?.today || {}).map((id) =>
    namespacedId(manifest.pluginId, id),
  );
  const actualToday = (handles.todaySections || []).map((item) => item.id);
  issues.push(...equalSets(asSet(declaredToday), asSet(actualToday), manifest.pluginId, 'today section'));

  return issues;
}

export function reconcileRenderer(manifest: PluginManifest, handles: PluginRendererHandles | undefined): CatalogIssue[] {
  if (!handles) {
    return [{ code: 'reconcile', pluginId: manifest.pluginId, message: `Plugin ${manifest.pluginId} has no renderer implementation` }];
  }
  const issues: CatalogIssue[] = [];
  const declaredWorkspaces = Object.entries(manifest.contributions.workbench?.workspaces || {}).map(([id, spec]) =>
    contributionKey(manifest.pluginId, id, spec.key),
  );
  const actualWorkspaces = (handles.workbenchTools || []).map((item) => item.workspaceKey);
  issues.push(...equalSets(asSet(declaredWorkspaces), asSet(actualWorkspaces), manifest.pluginId, 'workspace'));

  const declaredActions = Object.entries(manifest.contributions.workbench?.actions || {}).map(([id, spec]) =>
    contributionKey(manifest.pluginId, id, spec.id),
  );
  const actualActions = (handles.workbenchActions || []).map((item) => item.id);
  issues.push(...equalSets(asSet(declaredActions), asSet(actualActions), manifest.pluginId, 'workbench action'));

  const declaredSlots = Object.keys(manifest.contributions.shell?.slots || {});
  const actualSlots = (handles.shellSlots || []).map((item) => item.id);
  issues.push(...equalSets(asSet(declaredSlots), asSet(actualSlots), manifest.pluginId, 'shell slot'));

  return issues;
}
