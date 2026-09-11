import dayjs from 'dayjs';
import type { PluginMainContribution, PluginMainContext, TodayContribution } from '@true-north/plugin-sdk';
import { LibraryController } from './service/bookmark.route-controller';
import { bookmarkCaptureAdopter } from './service/capture.adopter';
import { bookmarkService } from './service/bookmark.service';
import { bindActivityPort } from './ports';
import { activateStorage, disposeStorage } from './storage';
import { libraryQuery } from './query';

const today: TodayContribution = {
  pluginId: 'library',
  async collect() {
    const todayDate = dayjs().format('YYYY-MM-DD');
    const bookmarks = await bookmarkService.list();
    return {
      bookmarkCount: bookmarks.filter((item) => dayjs(item.savedAt).format('YYYY-MM-DD') === todayDate).length,
    };
  },
};

export function createLibraryMain(): PluginMainContribution {
  return {
    ipcControllers: [{ id: 'library', routePrefix: '/library', controller: LibraryController }],
    query: libraryQuery,
    captureAdopters: [bookmarkCaptureAdopter],
    today,
    async activate(ctx: PluginMainContext) {
      await activateStorage(ctx.space);
      bindActivityPort(ctx.activity);
    },
    async dispose() {
      await disposeStorage();
    },
  };
}
