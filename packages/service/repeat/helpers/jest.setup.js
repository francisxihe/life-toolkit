// 导入测试DOM断言
require('@testing-library/jest-dom');

// 添加全局模拟
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟dayjs扩展
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  return originalDayjs;
});
