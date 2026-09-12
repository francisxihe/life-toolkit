import {
  activationOrder,
  parsePluginManifest,
  validateManifests,
  type CatalogIssue,
  type PluginManifest,
} from '@true-north/plugin-contract';
import type { PluginDescriptor, PluginMainModule, PluginRendererModule } from './runtime.ts';

export type AssembledPlugin = {
  manifest: PluginManifest;
  main?: PluginMainModule;
  renderer?: PluginRendererModule;
};

export type PluginCatalog = {
  plugins: AssembledPlugin[];
  order: string[];
  issues: CatalogIssue[];
};

export type AssembleCatalogOptions = {
  side: 'main' | 'renderer' | 'manifest';
};

async function resolveMain(loader: PluginDescriptor): Promise<PluginMainModule | undefined> {
  if (!loader.loadMain) return undefined;
  const loaded = await loader.loadMain();
  if (typeof (loaded as { createMain?: unknown }).createMain === 'function') {
    return await (loaded as { createMain: () => PluginMainModule | Promise<PluginMainModule> }).createMain();
  }
  return loaded as PluginMainModule;
}

async function resolveRenderer(loader: PluginDescriptor): Promise<PluginRendererModule | undefined> {
  if (!loader.loadRenderer) return undefined;
  const loaded = await loader.loadRenderer();
  if (typeof (loaded as { createRenderer?: unknown }).createRenderer === 'function') {
    return (loaded as { createRenderer: () => PluginRendererModule }).createRenderer();
  }
  return loaded as PluginRendererModule;
}

export async function assemblePluginCatalog(
  loaders: PluginDescriptor[],
  options: AssembleCatalogOptions,
): Promise<PluginCatalog> {
  const manifests = loaders.map((loader) => parsePluginManifest(loader.manifest));
  const issues = validateManifests(manifests);
  const order = activationOrder(manifests);

  if (options.side === 'manifest') {
    return {
      plugins: loaders.map((loader) => ({ manifest: parsePluginManifest(loader.manifest) })),
      order,
      issues,
    };
  }

  const plugins: AssembledPlugin[] = [];
  for (const pluginId of order) {
    const loader = loaders.find((item) => item.manifest.pluginId === pluginId);
    if (!loader) continue;
    plugins.push({
      manifest: parsePluginManifest(loader.manifest),
      main: options.side === 'main' ? await resolveMain(loader) : undefined,
      renderer: options.side === 'renderer' ? await resolveRenderer(loader) : undefined,
    });
  }

  return { plugins, order, issues };
}

export { reconcileMain, reconcileRenderer } from './reconcile.ts';
