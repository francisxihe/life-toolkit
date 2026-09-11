import { message } from '@sue/design-web-react';
import { Modal } from '@sue/design-web-react';
import { LibraryController } from '@true-north/web-service';
import type { WorkbenchExtractHandler } from '@true-north/plugin-sdk';

export const libraryExtractHandler: WorkbenchExtractHandler = async ({ result, url }) => {
  if (!result.markdownPath) {
    message.success('已拉取正文');
    return;
  }
  const existing = url ? await LibraryController.findByUrl(url) : null;
  let saveMode: 'create' | 'update' | 'save_as' = 'create';
  if (existing) {
    saveMode = await new Promise((resolve) => {
      Modal.confirm({
        title: '这个网址已经收藏过',
        content: '要更新已有文稿，还是另存一份？',
        okText: '更新',
        cancelText: '另存',
        onOk: () => resolve('update'),
        onCancel: () => resolve('save_as'),
      });
    });
  }
  await LibraryController.create({
    title: result.title || url || '未命名文稿',
    url,
    markdownPath: result.markdownPath,
    articleDir: result.articleDir || undefined,
    saveMode,
    existingId: existing?.id,
  });
  message.success('已收藏到本地');
};
