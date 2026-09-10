import { app, session, shell } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { StandardDocument } from '@sue/extract';
import { EMBEDDED_BROWSER_PARTITION } from '@true-north/vo';

type DownloadedImage = {
  originalUrl: string;
  filePath: string;
  relativePath: string;
};

function slugForFilename(title: string | null): string {
  if (!title) return `article-${Date.now()}`;
  const slug = title
    .replace(/\s+/g, '-')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, '')
    .slice(0, 60);
  return slug || `article-${Date.now()}`;
}

export function extractOutputRoot(): string {
  return path.join(app.getPath('documents'), '知止', 'extract');
}

async function downloadImages(
  images: string[],
  articleDir: string,
  baseSlug: string,
): Promise<DownloadedImage[]> {
  if (!images.length) return [];
  const imgDir = path.join(articleDir, 'images');
  await fs.mkdir(imgDir, { recursive: true });
  const ses = session.fromPartition(EMBEDDED_BROWSER_PARTITION);
  const unique = Array.from(new Set(images.filter(Boolean)));

  const results = await Promise.all(
    unique.map(async (imgUrl, index) => {
      try {
        const urlObj = new URL(imgUrl);
        const extMatch = urlObj.pathname.match(/\.(jpg|jpeg|png|webp|gif)$/i);
        const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
        const filename = `${baseSlug || 'image'}-${index + 1}${ext}`;
        const filePath = path.join(imgDir, filename);
        const response = await ses.fetch(imgUrl, {
          headers: {
            Referer: `${urlObj.protocol}//${urlObj.hostname}/`,
          },
        });
        if (!response.ok) return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        return {
          originalUrl: imgUrl,
          filePath,
          relativePath: `./${path.relative(articleDir, filePath).split(path.sep).join('/')}`,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((item): item is DownloadedImage => Boolean(item));
}

function withLocalImages(doc: StandardDocument, downloaded: DownloadedImage[]): StandardDocument {
  if (!downloaded.length) return doc;
  const urlToLocal = new Map(downloaded.map((item) => [item.originalUrl, item.relativePath]));
  let content = doc.contentMarkdown;
  if (typeof content === 'string') {
    urlToLocal.forEach((localPath, originalUrl) => {
      content = content?.split(originalUrl).join(localPath) ?? content;
    });
    content = content.replace(/!\[[^\]]*]\(https?:\/\/[^)]+\)\n*/g, '');
  }
  return {
    ...doc,
    contentMarkdown: content,
    images: (doc.images ?? []).map((url) => urlToLocal.get(url)).filter((item): item is string => Boolean(item)),
  };
}

export type SavedExtract = {
  markdownPath: string;
  articleDir: string;
};

export async function saveExtractedDocument(
  doc: StandardDocument,
  toMarkdown: (next: StandardDocument) => string,
): Promise<SavedExtract> {
  const rootDir = extractOutputRoot();
  const baseSlug = slugForFilename(doc.title);
  const articleDir = path.join(rootDir, `${baseSlug}-${Date.now()}`);
  await fs.mkdir(articleDir, { recursive: true });

  let markdownDoc = doc;
  if (doc.images.length) {
    const downloaded = await downloadImages(doc.images, articleDir, baseSlug);
    if (downloaded.length) markdownDoc = withLocalImages(doc, downloaded);
  }

  const markdownPath = path.join(articleDir, `${baseSlug}.md`);
  await fs.writeFile(markdownPath, toMarkdown(markdownDoc), 'utf8');
  shell.showItemInFolder(markdownPath);
  return { markdownPath, articleDir };
}
