import "reflect-metadata";
import { DataSource } from "typeorm";
import { app } from "electron";
import path from "path";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { User } from "./users/user.entity";
import { Goal, Habit, Task, Todo, TodoRepeat } from "@life-toolkit/business-server";

// 开发环境使用项目数据库
const getDatabasePath = () => {
  if (process.env.NODE_ENV === "development") {
    // 开发环境使用项目根目录下的数据库文件
    return path.join(process.cwd(), "database.sqlite");
  } else {
    // 生产环境使用用户数据目录
    try {
      return path.join(app.getPath("userData"), "life-toolkit.db");
    } catch (error) {
      return path.join(process.cwd(), "life-toolkit.db");
    }
  }
};

const databasePath = getDatabasePath();

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: databasePath,
  synchronize: true, // 开发环境自动同步表结构
  logging: process.env.NODE_ENV === "development" ? ["error"] : undefined,
  entities: [User, Goal, Task, Todo, TodoRepeat, Habit],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
});

// 初始化数据库连接
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("数据库连接已建立", databasePath);
    }
  } catch (error) {
    console.error("数据库连接失败:", error);
    throw error;
  }
};

// 关闭数据库连接
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      // 添加超时保护，避免长时间等待
      const closePromise = AppDataSource.destroy();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('数据库关闭超时')), 5000);
      });
      
      await Promise.race([closePromise, timeoutPromise]);
      console.log("数据库连接已关闭");
    }
  } catch (error) {
    console.error("关闭数据库连接失败:", error);
    // 强制标记为未初始化状态
    if (AppDataSource.isInitialized) {
      try {
        (AppDataSource as any).isInitialized = false;
      } catch (e) {
        // 忽略设置状态时的错误
      }
    }
  }
};
