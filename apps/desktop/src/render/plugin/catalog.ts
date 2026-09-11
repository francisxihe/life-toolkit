import { Sparkles, Blocks } from 'lucide-react';
import type { PluginModuleLoader, PluginRendererRuntime, PluginRuntimeEntry } from '@true-north/plugin-sdk';
import { bindRendererRuntime, assemblePluginCatalog, getRendererRuntime, pluginPath } from '@true-north/plugin-sdk';
import { growthManifest } from '@true-north/plugin-growth/manifest';
import { expenseManifest } from '@true-north/plugin-expense/manifest';
import { purchaseManifest } from '@true-north/plugin-purchase/manifest';
import { libraryManifest } from '@true-north/plugin-library/manifest';
import type { IRoute } from '@/router/routes';
import lazyload from '@/utils/lazyload';
import { createAiWorkspaceHost } from '@/features/ai/workspace-host';
import { activityWorkbenchTools } from './activity/tools';
import { pluginPaths } from './paths';

export const rendererPluginLoaders: PluginModuleLoader[] = [
  { manifest: growthManifest, loadRenderer: () => import('@true-north/plugin-growth/renderer') },
  { manifest: expenseManifest, loadRenderer: () => import('@true-north/plugin-expense/renderer') },
  { manifest: purchaseManifest, loadRenderer: () => import('@true-north/plugin-purchase/renderer') },
  { manifest: libraryManifest, loadRenderer: () => import('@true-north/plugin-library/renderer') },
];

export async function bootRendererPlugins() {
  const catalog = await assemblePluginCatalog(rendererPluginLoaders, { loadRuntime: true });
  const plugins = catalog.plugins
    .map((plugin): PluginRuntimeEntry | null => {
      const renderer = plugin.renderer;
      if (!renderer) return null;
      return {
        pluginId: plugin.manifest.pluginId,
        nameKey: renderer.nameKey,
        path: pluginPath(plugin.manifest.pluginId),
        order: renderer.order,
        icon: renderer.icon,
        descriptionKey: renderer.descriptionKey,
        categoryKey: renderer.categoryKey,
        keywords: renderer.keywords,
        load: renderer.load,
      };
    })
    .filter((entry): entry is PluginRuntimeEntry => Boolean(entry))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const shellSlots = catalog.plugins.flatMap((plugin) => plugin.renderer?.shellSlots || []);
  const workbenchTools = [
    ...activityWorkbenchTools,
    ...catalog.plugins.flatMap((plugin) => plugin.renderer?.workbenchTools || []),
  ];
  const workbenchActions = catalog.plugins.flatMap((plugin) => plugin.renderer?.workbenchActions || []);
  const locales = catalog.plugins.flatMap((plugin) => plugin.renderer?.locales || []);
  const entityPresenters = catalog.plugins.flatMap((plugin) => plugin.renderer?.entityPresenters || []);
  bindRendererRuntime({
    plugins,
    shellSlots,
    workbenchTools: workbenchTools as never,
    workbenchActions,
    workspaceHost: createAiWorkspaceHost(),
    locales,
    entityPresenters,
    createEntitySources: (navigate) =>
      catalog.plugins.flatMap((plugin) => plugin.renderer?.entitySources?.(navigate) || []),
  });
  return catalog;
}

export function pluginRoutes(): IRoute[] {
  getRendererRuntime();
  return [
    {
      name: 'menu.ai',
      key: '/ai',
      meta: { icon: Sparkles },
      loader: () => import('@/features/ai'),
    } as IRoute,
    {
      name: 'menu.plugins',
      key: pluginPaths.root,
      meta: { icon: Blocks },
      loader: () => import('@/plugin/PluginsHome'),
    },
  ];
}

export function attachPageLoaders(routes: IRoute[]): IRoute[] {
  return routes.map((route) => {
    const loader = (route as IRoute & { loader?: () => Promise<{ default: unknown }> }).loader;
    const next = { ...route };
    if (loader) {
      (next as { component?: unknown }).component = lazyload(loader as never);
    }
    if (next.children) next.children = attachPageLoaders(next.children);
    return next;
  });
}

export type { PluginRendererRuntime };
