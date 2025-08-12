import "reflect-metadata";
import { DataSource } from "typeorm";
import { app } from "electron";
import path from "path";
import { User } from "./entities/user.entity";
import { Goal } from "./entities/goal.entity";
import { Task } from "./entities/task.entity";
import { Todo } from "./entities/todo.entity";
import { Habit } from "./entities/habit.entity";

// 获取用户数据目录
const getUserDataPath = () => {
  try {
    return app.getPath('userData');
  } catch (error) {
    // 如果在开发环境中无法获取 app 路径，使用当前目录
    return process.cwd();
  }
};

const databasePath = path.join(getUserDataPath(), 'life-toolkit.db');

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: databasePath,
  synchronize: true, // 开发环境自动同步表结构
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Goal, Task, Todo, Habit],
  migrations: [],
  subscribers: [],
});

// 初始化数据库连接
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('数据库连接已建立');
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

// 关闭数据库连接
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('数据库连接已关闭');
    }
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
  }
};