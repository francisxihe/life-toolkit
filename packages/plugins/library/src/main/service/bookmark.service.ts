import fs from 'node:fs/promises';
import { shell } from 'electron';
import type { EntityManager } from 'typeorm';
import { BookmarkFileStatus, BookmarkSaveMode } from '@true-north/enum';
import type { BookmarkFilterVo, BookmarkVo, CreateBookmarkVo, UpdateBookmarkVo } from '@true-north/vo';
import { store } from '../storage';
import { Bookmark } from './bookmark.entity';
import { recordLibraryActivity, unlinkLibraryEntity } from '../context';

function toIso(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function resolveFileStatus(path?: string, fallback = BookmarkFileStatus.OK): Promise<BookmarkFileStatus> {
  if (!path) return fallback;
  try {
    await fs.access(path);
    return BookmarkFileStatus.OK;
  } catch {
    return BookmarkFileStatus.MISSING;
  }
}

async function toVo(entity: Bookmark): Promise<BookmarkVo> {
  const fileStatus = await resolveFileStatus(entity.markdownPath, entity.fileStatus);
  if (fileStatus !== entity.fileStatus) {
    entity.fileStatus = fileStatus;
    await store().getRepository(Bookmark).save(entity);
  }
  return {
    id: entity.id,
    title: entity.title,
    url: entity.url,
    excerpt: entity.excerpt,
    tags: entity.tags || [],
    savedAt: toIso(entity.savedAt),
    markdownPath: entity.markdownPath,
    articleDir: entity.articleDir,
    fileStatus,
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

export class BookmarkService {
  private repo(manager?: EntityManager) {
    return (manager ?? store().manager).getRepository(Bookmark);
  }

  async findByUrl(url: string): Promise<BookmarkVo | null> {
    const entity = await this.repo().findOne({ where: { url, deletedAt: undefined as never } });
    return entity ? toVo(entity) : null;
  }

  async list(filter?: BookmarkFilterVo): Promise<BookmarkVo[]> {
    const qb = this.repo().createQueryBuilder('item').andWhere('item.deletedAt IS NULL');
    if (filter?.url) qb.andWhere('item.url = :url', { url: filter.url });
    if (filter?.keyword?.trim()) {
      const keyword = `%${filter.keyword.trim()}%`;
      qb.andWhere(
        '(item.title LIKE :keyword OR item.excerpt LIKE :keyword OR item.url LIKE :keyword)',
        { keyword },
      );
    }
    const list = await qb.orderBy('item.savedAt', 'DESC').getMany();
    return Promise.all(list.map(toVo));
  }

  async create(
    body: CreateBookmarkVo,
    options?: { skipActivity?: boolean; manager?: EntityManager }
  ): Promise<BookmarkVo> {
    const url = body?.url?.trim();
    const title = body?.title?.trim();
    if (!url) throw new Error('缺少网址');
    if (!title) throw new Error('缺少标题');
    const repo = this.repo(options?.manager);

    const existing = await repo.findOne({ where: { url, deletedAt: undefined as never } });
    if (existing && body.saveMode !== BookmarkSaveMode.SAVE_AS && body.saveMode !== BookmarkSaveMode.UPDATE) {
      const error = new Error('同一网址已收藏') as Error & { existingId?: string };
      error.existingId = existing.id;
      throw error;
    }

    if (existing && (body.saveMode === BookmarkSaveMode.UPDATE || body.existingId === existing.id)) {
      existing.title = title;
      existing.excerpt = body.excerpt;
      existing.tags = body.tags || existing.tags;
      existing.markdownPath = body.markdownPath || existing.markdownPath;
      existing.articleDir = body.articleDir || existing.articleDir;
      existing.savedAt = new Date();
      existing.fileStatus = (body.fileStatus as BookmarkFileStatus) || BookmarkFileStatus.OK;
      const saved = await repo.save(existing);
      return toVo(saved);
    }

    const entity = repo.create({
      title,
      url,
      excerpt: body.excerpt,
      tags: body.tags || [],
      savedAt: new Date(),
      markdownPath: body.markdownPath,
      articleDir: body.articleDir,
      fileStatus: (body.fileStatus as BookmarkFileStatus) || (body.markdownPath ? BookmarkFileStatus.OK : BookmarkFileStatus.PENDING),
    });
    const saved = await repo.save(entity);
    const vo = await toVo(saved);
    if (!options?.skipActivity) {
      await recordLibraryActivity({
        title: vo.title,
        entityId: vo.id,
        label: vo.title,
      });
    }
    return vo;
  }

  async update(id: string, body: UpdateBookmarkVo): Promise<BookmarkVo> {
    const current = await this.repo().findOneBy({ id });
    if (!current) throw new Error('收藏不存在');
    if (body.title) current.title = body.title;
    if (body.excerpt !== undefined) current.excerpt = body.excerpt;
    if (body.tags) current.tags = body.tags;
    if (body.markdownPath !== undefined) current.markdownPath = body.markdownPath;
    if (body.articleDir !== undefined) current.articleDir = body.articleDir;
    if (body.fileStatus) current.fileStatus = body.fileStatus as BookmarkFileStatus;
    return toVo(await this.repo().save(current));
  }

  async delete(id: string): Promise<boolean> {
    await this.repo().softDelete(id);
    await unlinkLibraryEntity(id);
    return true;
  }

  async reveal(id: string): Promise<boolean> {
    const current = await this.repo().findOneBy({ id });
    if (!current?.markdownPath) throw new Error('没有本地文件');
    const status = await resolveFileStatus(current.markdownPath);
    if (status === BookmarkFileStatus.MISSING) {
      current.fileStatus = BookmarkFileStatus.MISSING;
      await this.repo().save(current);
      throw new Error('本地文件不可用');
    }
    shell.showItemInFolder(current.markdownPath);
    return true;
  }

  async openMarkdown(id: string): Promise<boolean> {
    const current = await this.repo().findOneBy({ id });
    if (!current?.markdownPath) throw new Error('没有本地文件');
    const status = await resolveFileStatus(current.markdownPath);
    if (status === BookmarkFileStatus.MISSING) {
      current.fileStatus = BookmarkFileStatus.MISSING;
      await this.repo().save(current);
      throw new Error('本地文件不可用');
    }
    await shell.openPath(current.markdownPath);
    return true;
  }
}

export const bookmarkService = new BookmarkService();
