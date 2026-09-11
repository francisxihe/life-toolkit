import { useEffect, useState } from 'react';
import { Button, Flex, Input, Tag, message } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { BookmarkFileStatus } from '@true-north/enum';
import type { BookmarkVo } from '@true-north/vo';
import { BrowserService, LibraryController } from '@true-north/web-service';
import { requestOpenWorkbench } from '@true-north/plugin-sdk';
import dayjs from 'dayjs';

export default function LibraryPage() {
  const [list, setList] = useState<BookmarkVo[]>([]);
  const [keyword, setKeyword] = useState('');

  const load = async () => {
    const result = await LibraryController.list({ keyword: keyword || undefined });
    setList(result?.list || []);
  };

  useEffect(() => {
    void load();
  }, [keyword]);

  const openUrl = async (url: string) => {
    await BrowserService.setVisible(true);
    await BrowserService.createTab(url);
  };

  const openWeb = async (url: string) => {
    requestOpenWorkbench(true);
    await openUrl(url);
  };

  return (
    <ProductSurface id={productRef('library.view.search')}>
      <Flex vertical container="full" className="p-5 gap-4">
        <h1 className="text-title-2 font-medium">收藏</h1>
        <Input
          allowClear
          placeholder="搜索标题、摘要或网址"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Flex vertical gap={8}>
          {list.map((item) => (
            <Flex key={item.id} vertical className="rounded-lg bg-bg-2 p-4 gap-2">
              <Flex justify="space-between" align="center">
                <strong>{item.title}</strong>
                {item.fileStatus === BookmarkFileStatus.MISSING ? (
                  <Tag color="orange">本地文件不可用</Tag>
                ) : null}
              </Flex>
              <span className="text-text-3 text-xs">{item.url}</span>
              {item.excerpt ? <p className="m-0 text-sm">{item.excerpt}</p> : null}
              <span className="text-text-3 text-xs">{dayjs(item.savedAt).format('YYYY-MM-DD HH:mm')}</span>
              <Flex gap={8}>
                <Button size="small" onClick={() => void openWeb(item.url)}>打开原网页</Button>
                <Button
                  size="small"
                  disabled={item.fileStatus === BookmarkFileStatus.MISSING || !item.markdownPath}
                  onClick={() => LibraryController.openMarkdown(item.id).catch((error) => message.error(error.message))}
                >
                  打开本地文稿
                </Button>
                <Button
                  size="small"
                  disabled={!item.markdownPath}
                  onClick={() => LibraryController.reveal(item.id).catch((error) => message.error(error.message))}
                >
                  定位文件
                </Button>
              </Flex>
            </Flex>
          ))}
          {!list.length ? <p className="text-text-3">还没有收藏。可在工作台把当前页收到本地。</p> : null}
        </Flex>
      </Flex>
    </ProductSurface>
  );
}
