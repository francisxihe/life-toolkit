import { pluginIpc } from './port';
import type { BookmarkFilterVo, BookmarkVo, CreateBookmarkVo, UpdateBookmarkVo } from '@true-north/vo';

export default class LibraryController {
  static async list(query?: BookmarkFilterVo) {
    return pluginIpc().get<{ list: BookmarkVo[] }>('/library/bookmarks', query);
  }

  static async findByUrl(url: string) {
    return pluginIpc().get<BookmarkVo | null>('/library/bookmarks/url', { url });
  }

  static async create(body: CreateBookmarkVo) {
    return pluginIpc().post<BookmarkVo>('/library/bookmarks', body);
  }

  static async update(id: string, body: UpdateBookmarkVo) {
    return pluginIpc().put<BookmarkVo>(`/library/bookmarks/${id}`, body);
  }

  static async delete(id: string) {
    return pluginIpc().remove<boolean>(`/library/bookmarks/${id}`);
  }

  static async reveal(id: string) {
    return pluginIpc().post<boolean>(`/library/bookmarks/${id}/reveal`);
  }

  static async openMarkdown(id: string) {
    return pluginIpc().post<boolean>(`/library/bookmarks/${id}/open`);
  }
}
