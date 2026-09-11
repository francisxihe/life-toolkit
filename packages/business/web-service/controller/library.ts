import { request } from '../request';
import type { BookmarkFilterVo, BookmarkVo, CreateBookmarkVo, UpdateBookmarkVo } from '@true-north/vo';

export default class LibraryController {
  static async list(query?: BookmarkFilterVo) {
    return request<{ list: BookmarkVo[] }>({ method: 'get' })('/library/bookmarks', query);
  }

  static async findByUrl(url: string) {
    return request<BookmarkVo | null>({ method: 'get' })('/library/bookmarks/url', { url });
  }

  static async create(body: CreateBookmarkVo) {
    return request<BookmarkVo>({ method: 'post' })('/library/bookmarks', body);
  }

  static async update(id: string, body: UpdateBookmarkVo) {
    return request<BookmarkVo>({ method: 'put' })(`/library/bookmarks/${id}`, body);
  }

  static async delete(id: string) {
    return request<boolean>({ method: 'remove' })(`/library/bookmarks/${id}`);
  }

  static async reveal(id: string) {
    return request<boolean>({ method: 'post' })(`/library/bookmarks/${id}/reveal`);
  }

  static async openMarkdown(id: string) {
    return request<boolean>({ method: 'post' })(`/library/bookmarks/${id}/open`);
  }
}
