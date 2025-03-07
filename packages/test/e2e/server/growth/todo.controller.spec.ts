import request from 'supertest';
import { TodoStatus } from '@life-toolkit/vo/growth';
import { getApiBaseUrl } from '../../../jest-e2e.setup';

describe('TodoController (e2e)', () => {
  const baseUrl = getApiBaseUrl();
  let todoId: string;

  describe('创建待办', () => {
    it('应该成功创建一个待办', () => {
      return request(baseUrl)
        .post('/todo/create')
        .send({
          name: '测试待办',
          status: TodoStatus.TODO,
          planDate: new Date().toISOString().split('T')[0],
          tags: ['测试', 'e2e'],
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('测试待办');
          todoId = res.body.data.id;
        });
    });
  });

  describe('获取待办详情', () => {
    it('应该成功获取待办详情', () => {
      return request(baseUrl)
        .get(`/todo/detail/${todoId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(todoId);
          expect(res.body.data.name).toBe('测试待办');
        });
    });

    it('获取不存在的待办应该返回错误', () => {
      return request(baseUrl)
        .get('/todo/detail/nonexistent-id')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).not.toBe(200);
        });
    });
  });

  describe('更新待办', () => {
    it('应该成功更新待办', () => {
      return request(baseUrl)
        .put(`/todo/update/${todoId}`)
        .send({
          name: '已更新的测试待办',
          status: TodoStatus.TODO,
          planDate: new Date().toISOString().split('T')[0],
          tags: ['测试', 'e2e', '已更新'],
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('已更新的测试待办');
        });
    });
  });

  describe('待办状态操作', () => {
    it('应该成功完成待办', () => {
      return request(baseUrl)
        .put('/todo/batch-done')
        .send({
          idList: [todoId],
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });

    it('应该成功恢复待办', () => {
      return request(baseUrl)
        .put(`/todo/restore/${todoId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });

    it('应该成功放弃待办', () => {
      return request(baseUrl)
        .put(`/todo/abandon/${todoId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });
  });

  describe('获取待办列表', () => {
    it('应该成功获取待办列表', () => {
      return request(baseUrl)
        .get('/todo/list')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data.list)).toBeTruthy();
        });
    });

    it('应该成功获取待办分页列表', () => {
      return request(baseUrl)
        .get('/todo/page?pageNum=1&pageSize=10')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.list).toBeDefined();
          expect(res.body.data.total).toBeDefined();
          expect(Number(res.body.data.pageNum)).toBe(1);
          expect(Number(res.body.data.pageSize)).toBe(10);
        });
    });
  });

  describe('删除待办', () => {
    it('应该成功删除待办', () => {
      return request(baseUrl)
        .delete(`/todo/delete/${todoId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });
  });
}); 