import type { BookmarkFileStatus, BookmarkSaveMode } from '@true-north/enum';
import type { BaseEntityVo } from '../common';

export type BookmarkVo = BaseEntityVo & {
  title: string;
  url: string;
  excerpt?: string;
  tags: string[];
  savedAt: string;
  markdownPath?: string;
  articleDir?: string;
  fileStatus: BookmarkFileStatus | `${BookmarkFileStatus}`;
};

export type CreateBookmarkVo = {
  title: string;
  url: string;
  excerpt?: string;
  tags?: string[];
  markdownPath?: string;
  articleDir?: string;
  fileStatus?: BookmarkFileStatus | `${BookmarkFileStatus}`;
  saveMode?: BookmarkSaveMode | `${BookmarkSaveMode}`;
  existingId?: string;
};

export type UpdateBookmarkVo = Partial<Omit<CreateBookmarkVo, 'saveMode' | 'existingId'>>;

export type BookmarkFilterVo = {
  keyword?: string;
  url?: string;
};

export type BookmarkDuplicateVo = {
  existing: BookmarkVo;
};
