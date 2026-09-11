import type { CaptureAdopter } from '@true-north/plugin-sdk';
import { bookmarkService } from './bookmark.service';

export const bookmarkCaptureAdopter: CaptureAdopter = {
  type: 'library.bookmark',
  async adopt(suggestion) {
    const payload = suggestion.payload || {};
    const bookmark = await bookmarkService.create(
      {
        title: String(payload.title || ''),
        url: String(payload.url || payload.title || ''),
        excerpt: payload.note ? String(payload.note) : undefined,
        tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : undefined,
        fileStatus: payload.url ? 'pending' : 'ok',
      },
      { skipActivity: true },
    );
    return {
      pluginId: 'library',
      entityType: 'bookmark',
      entityId: bookmark.id,
      role: 'bookmark',
      label: bookmark.title,
    };
  },
};
