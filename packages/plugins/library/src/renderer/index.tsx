import type { PluginRendererContribution } from '@true-north/plugin-sdk';
import { Bookmark } from 'lucide-react';
import { LIBRARY_EXTRACT_ACTION, libraryPaths } from '../contract';
import { libraryExtractHandler } from './pages/workbench/extract';
import { libraryLocales } from './locales';

export function createRenderer(): PluginRendererContribution {
  return {
    nameKey: 'menu.library',
    icon: Bookmark,
    descriptionKey: 'library.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['bookmark', 'library', '收藏', '书签'],
    order: 40,
    load: () => import('./pages/index'),
    workbenchActions: [
      {
        id: LIBRARY_EXTRACT_ACTION,
        run: async (input) => {
          await libraryExtractHandler(input as never);
        },
      },
    ],
    locales: [libraryLocales],
    entityPresenters: [
      { pluginId: 'library', entityType: 'bookmark', kindLabel: '收藏', openPath: () => libraryPaths.root },
    ],
  };
}
