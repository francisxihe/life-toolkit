import { initializeDatabase, closeDatabase } from './database.config';
import { app } from 'electron';

/**
 * 初始化数据库
 */
export async function initDB(): Promise<void> {
  try {
    console.log('正在初始化数据库...');
    await initializeDatabase();
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

/**
 * 关闭数据库连接
 */
export async function closeDB(): Promise<void> {
  try {
    console.log('正在关闭数据库连接...');
    await closeDatabase();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
  }
}

/**
 * 设置应用退出时的数据库清理
 */
export function setupDatabaseCleanup(): void {
  // 应用退出前关闭数据库连接
  app.on('before-quit', async () => {
    await closeDB();
  });

  // 所有窗口关闭时关闭数据库连接
  app.on('window-all-closed', async () => {
    await closeDB();
  });

  // 应用激活时确保数据库连接
  app.on('activate', async () => {
    try {
      await initDB();
    } catch (error) {
      console.error('重新激活时数据库初始化失败:', error);
    }
  });
}