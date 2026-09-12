import { getPluginHostOptional } from '../../plugin/active-host';
import { disposePluginPlatform } from '../../plugin/host';
import { app } from 'electron';

let isClosing = false;

export async function initDB(): Promise<void> {
  if (getPluginHostOptional()?.dataSource?.isInitialized) return;
  throw new Error('Call bootPluginPlatform before using the database');
}

export async function closeDB(): Promise<void> {
  if (isClosing) return;
  isClosing = true;
  try {
    await disposePluginPlatform();
  } finally {
    isClosing = false;
  }
}

export function setupDatabaseCleanup(): void {
  let isQuitting = false;
  app.on('before-quit', (event) => {
    if (!isQuitting && getPluginHostOptional()?.dataSource?.isInitialized) {
      isQuitting = true;
      event.preventDefault();
      closeDB().finally(() => {
        app.quit();
      });
    }
  });
}
