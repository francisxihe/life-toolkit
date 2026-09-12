import { Bookmark } from 'lucide-react';
import { defineRendererImplementation } from '@true-north/plugin-sdk';
import { libraryManifest } from '../plugin';
import { LIBRARY_EXTRACT_ACTION, libraryPaths } from '../contract';
import { libraryExtractHandler } from './pages/workbench/extract';
import { libraryLocales } from './locales';
import { bindPluginIpc } from '../client';

export function createRenderer() {
  return defineRendererImplementation(libraryManifest, {
    activate(ctx) {
      bindPluginIpc(ctx.ipc);
      return {
        icon: Bookmark,
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
    },
  });
}
