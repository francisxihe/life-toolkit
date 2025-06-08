import 'reflect-metadata';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.DB_DATABASE = ':memory:';

// 全局测试配置
jest.setTimeout(30000);

// 模拟console.log以减少测试输出噪音
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // 在测试期间静默console输出，除非是错误
  console.log = jest.fn();
  console.warn = jest.fn();
  // 保留错误输出用于调试
  console.error = originalConsoleError;
});

afterAll(() => {
  // 恢复原始console方法
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// 全局测试工具
global.testUtils = {
  // 等待异步操作
  wait: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 创建测试日期
  createTestDate: (daysFromNow: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  },
  
  // 生成随机字符串
  randomString: (length: number = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  // 生成随机数字
  randomNumber: (min: number = 1, max: number = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

// 扩展全局类型
declare global {
  var testUtils: {
    wait: (ms?: number) => Promise<void>;
    createTestDate: (daysFromNow?: number) => Date;
    randomString: (length?: number) => string;
    randomNumber: (min?: number, max?: number) => number;
  };
} 