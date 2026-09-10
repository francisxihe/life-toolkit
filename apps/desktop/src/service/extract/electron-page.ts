import type { WebContents } from 'electron';
import type { ExtractPage } from '@sue/extract';

export function createElectronPage(contents: WebContents): ExtractPage {
  return {
    async evaluate<T, A>(pageFunction: (arg: A) => T | Promise<T>, arg: A): Promise<T> {
      if (contents.isDestroyed()) throw new Error('页面已关闭');
      const source = `(${pageFunction.toString()})(${JSON.stringify(arg)})`;
      return contents.executeJavaScript(source, true) as Promise<T>;
    },
  };
}

export async function waitForSelector(
  contents: WebContents,
  selector: string,
  timeout: number,
): Promise<void> {
  if (contents.isDestroyed()) return;
  const source = `new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      if (document.querySelector(${JSON.stringify(selector)})) {
        resolve(true);
        return;
      }
      if (Date.now() - started >= ${Math.max(0, timeout)}) {
        resolve(false);
        return;
      }
      setTimeout(check, 100);
    };
    check();
  })`;
  await contents.executeJavaScript(source, true).catch(() => undefined);
}
