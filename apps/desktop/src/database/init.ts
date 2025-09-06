import { initializeDatabase, closeDatabase, AppDataSource } from './database.config';
import { app } from 'electron';

// 数据库状态标记
let isClosing = false;

/**
 * 初始化数据库
 */
export async function initDB(): Promise<void> {
  try {
    // 检查是否已经初始化
    if (AppDataSource.isInitialized) {
      console.log('数据库已经初始化，跳过重复初始化');
      return;
    }
    
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
  // 防止重复关闭
  if (isClosing || !AppDataSource.isInitialized) {
    return;
  }
  
  isClosing = true;
  
  try {
    console.log('正在关闭数据库连接...');
    await closeDatabase();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
  } finally {
    isClosing = false;
  }
}

/**
 * 设置应用退出时的数据库清理
 */
export function setupDatabaseCleanup(): void {
  let isQuitting = false;

  // 应用退出前关闭数据库连接
  app.on('before-quit', (event) => {
    if (!isQuitting && AppDataSource.isInitialized) {
      isQuitting = true;
      event.preventDefault();
      
      closeDB().finally(() => {
        app.quit();
      });
    }
  });

  // macOS 特殊处理：应用激活时确保数据库连接
  if (process.platform === 'darwin') {
    app.on('activate', async () => {
      try {
        if (!AppDataSource.isInitialized && !isClosing) {
          await initDB();
        }
      } catch (error) {
        console.error('重新激活时数据库初始化失败:', error);
      }
    });
  }

  // 进程退出时的最后清理
  process.on('exit', () => {
    if (AppDataSource.isInitialized) {
      try {
        // 同步关闭，因为异步操作在 exit 事件中不可靠
        AppDataSource.destroy();
      } catch (error) {
        console.error('进程退出时关闭数据库失败:', error);
      }
    }
  });

  // 处理未捕获的异常
  process.on('uncaughtException', async (error) => {
    console.error('未捕获的异常:', error);
    await closeDB();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    console.error('未处理的 Promise 拒绝:', reason);
    await closeDB();
    process.exit(1);
  });
}