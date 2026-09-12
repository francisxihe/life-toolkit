import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@true-north/plugin-sdk/main';
import type { BookmarkFilterVo, BookmarkVo, CreateBookmarkVo, UpdateBookmarkVo } from '@true-north/vo';
import { bookmarkService } from './bookmark.service';

@Controller('/library')
export class LibraryController {
  @Get('/bookmarks', { description: '收藏列表' })
  async list(@Query() query?: BookmarkFilterVo): Promise<{ list: BookmarkVo[] }> {
    return { list: await bookmarkService.list(query) };
  }

  @Get('/bookmarks/url', { description: '按网址查找收藏' })
  async findByUrl(@Query() query?: { url?: string }): Promise<BookmarkVo | null> {
    if (!query?.url) return null;
    return bookmarkService.findByUrl(query.url);
  }

  @Post('/bookmarks', { description: '创建收藏' })
  async create(@Body() body: CreateBookmarkVo): Promise<BookmarkVo> {
    return bookmarkService.create(body);
  }

  @Put('/bookmarks/:id', { description: '更新收藏' })
  async update(@Param('id') id: string, @Body() body: UpdateBookmarkVo): Promise<BookmarkVo> {
    return bookmarkService.update(id, body);
  }

  @Delete('/bookmarks/:id', { description: '删除收藏' })
  async delete(@Param('id') id: string): Promise<boolean> {
    return bookmarkService.delete(id);
  }

  @Post('/bookmarks/:id/reveal', { description: '定位本地文件' })
  async reveal(@Param('id') id: string): Promise<boolean> {
    return bookmarkService.reveal(id);
  }

  @Post('/bookmarks/:id/open', { description: '打开本地文稿' })
  async openMarkdown(@Param('id') id: string): Promise<boolean> {
    return bookmarkService.openMarkdown(id);
  }
}
