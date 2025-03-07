import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// 移除对AppModule的导入
// import { AppModule } from '../../apps/server/src/app.module';

// 全局测试设置
global.beforeAll(async () => {
  // 在这里设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '3306';
  process.env.DB_USERNAME = 'root';
  process.env.DB_PASSWORD = 'Xuwh3.14a@';  
  process.env.DB_DATABASE = 'life_toolkit_test';  // 使用测试数据库
  
  // 设置API基础URL
  process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
});

// 获取API基础URL的辅助函数
export const getApiBaseUrl = (): string => {
  return process.env.API_BASE_URL || 'http://localhost:3000';
};

// 保留createTestApp函数的存根，以防某些测试仍然需要它
// 但在注释中标明这是旧方法，并建议使用新方法
/**
 * @deprecated 使用独立请求模式时不建议使用此函数
 * 请直接使用supertest和getApiBaseUrl()替代
 */
export const createTestApp = async (): Promise<INestApplication> => {
  throw new Error('此函数在独立请求模式下不可用。请使用supertest和getApiBaseUrl()替代。');
}; 