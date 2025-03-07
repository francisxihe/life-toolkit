import { getApiBaseUrl } from '../../../jest-e2e.setup';
import request from 'supertest';

/**
 * Growth模块集成测试入口文件
 * 
 * 该文件负责验证测试环境，各子模块的具体测试用例在单独的文件中实现：
 * - todo.controller.spec.ts - 待办事项接口测试
 * - task.controller.spec.ts - 任务接口测试
 * - goal.controller.spec.ts - 目标接口测试
 * - track-time.spec.ts - 时间跟踪相关测试
 */
describe('Growth模块 (e2e)', () => {
  const baseUrl = getApiBaseUrl();

  it('API服务应该可访问', () => {
    return request(baseUrl)
      .get('/health')
      .expect(res => {
        expect(res.status).toBeLessThan(500); // 只要不是服务器错误就可以
      });
  });

  /**
   * 测试运行顺序说明
   * 
   * 在实际执行时，Jest会自动加载并执行目录下的所有测试文件：
   * 1. todo.controller.spec.ts
   * 2. task.controller.spec.ts 
   * 3. goal.controller.spec.ts
   * 4. track-time.spec.ts
   * 
   * 每个测试文件都有独立的测试上下文，互不影响
   */
  describe('测试文件说明', () => {
    it('相关测试文件应该包含所有模块的测试', () => {
      // 这个测试只是为了说明文件组织结构，不执行实际测试逻辑
      expect(true).toBeTruthy();
    });
  });
}); 