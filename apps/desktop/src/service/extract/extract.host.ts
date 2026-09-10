import { createRequire } from 'node:module';
import type { WebContents } from 'electron';
import type { ExtractPage, ExtractRule, StandardDocument } from '@sue/extract';
import type { BrowserExtractResultVo } from '@true-north/vo';
import { createElectronPage, waitForSelector } from './electron-page';
import { saveExtractedDocument } from './save';

export type ExtractPack = {
  rules?: ExtractRule[];
  matchRule(url: string): ExtractRule;
  extract(page: ExtractPage, options: { url: string; rule?: ExtractRule }): Promise<StandardDocument>;
  toMarkdown(doc: StandardDocument): string;
};

const packs: ExtractPack[] = [];

export function registerExtractPack(pack: ExtractPack): void {
  if (packs.includes(pack)) return;
  packs.push(pack);
}

function ensureDefaultPacks(): void {
  if (packs.length > 0) return;
  const require = createRequire(import.meta.url);
  registerExtractPack(require('@sue/extract') as ExtractPack);
}

function matchPack(url: string): { pack: ExtractPack; rule: ExtractRule } {
  ensureDefaultPacks();
  for (const pack of packs) {
    const rule = pack.matchRule(url);
    if (rule) return { pack, rule };
  }
  throw new Error('没有匹配的抽取规则');
}

export async function extractFromContents(
  contents: WebContents,
  url: string,
): Promise<BrowserExtractResultVo> {
  if (!url) throw new Error('当前标签没有打开的页面');
  if (contents.isDestroyed()) throw new Error('页面已关闭');

  const { pack, rule } = matchPack(url);
  if (rule.waitFor) {
    await waitForSelector(contents, rule.waitFor, rule.waitTimeout ?? 8000);
  }

  const doc = await pack.extract(createElectronPage(contents), { url, rule });
  if (doc.status === 'blocked' || doc.status === 'empty') {
    return {
      status: doc.status,
      title: doc.title,
      markdownPath: null,
      articleDir: null,
      reason: doc.reason ?? (doc.status === 'empty' ? '未能识别正文' : '当前页无法拉取'),
    };
  }

  const saved = await saveExtractedDocument(doc, pack.toMarkdown);
  return {
    status: doc.status,
    title: doc.title,
    markdownPath: saved.markdownPath,
    articleDir: saved.articleDir,
    reason: doc.reason,
  };
}

ensureDefaultPacks();
