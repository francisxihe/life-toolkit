/**
 * 通用日志工具
 */
export function createLogger(prefix: string) {
  return function log(...args: any[]) {
    // eslint-disable-next-line no-console
    console.log(`[dev-tools/${prefix}]`, ...args);
  };
}

/**
 * 默认日志器
 */
export const log = createLogger('common');
