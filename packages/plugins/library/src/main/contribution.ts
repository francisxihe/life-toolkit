import dayjs from 'dayjs';
import { defineMainImplementation, namespacedId, type PluginMainContext } from '@true-north/plugin-sdk';
import { libraryManifest } from '../plugin';
import { LibraryController } from './service/bookmark.route-controller';
import { bookmarkCaptureAdopter } from './service/capture.adopter';
import { bookmarkService } from './service/bookmark.service';
import { bindLibraryContext } from './context';
import { activateStorage, disposeStorage } from './storage';
import { createLibraryQuery } from './query';

export function createLibraryMain() {
  return defineMainImplementation(libraryManifest, {
    async activate(ctx: PluginMainContext) {
      const runtime = await activateStorage(ctx.space);
      bindLibraryContext(ctx.activity);
      return {
        ipcControllers: { library: { controller: new LibraryController() } },
        query: createLibraryQuery(runtime),
        captureAdopters: [bookmarkCaptureAdopter],
        todaySections: [
          {
            id: namespacedId('library', 'bookmarks'),
            async collect() {
              const todayDate = dayjs().format('YYYY-MM-DD');
              const bookmarks = await bookmarkService.list();
              return {
                id: namespacedId('library', 'bookmarks'),
                kind: 'metric' as const,
                titleKey: 'plugins.hub.bookmarks',
                order: 30,
                value: bookmarks.filter((item) => dayjs(item.savedAt).format('YYYY-MM-DD') === todayDate).length,
              };
            },
          },
        ],
      };
    },
    async dispose() {
      await disposeStorage();
    },
  });
}
