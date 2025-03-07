import request from 'supertest';
import { TaskStatus } from '@life-toolkit/vo/growth';
import { getApiBaseUrl } from '../../../jest-e2e.setup';

describe('TaskController (e2e)', () => {
  const baseUrl = getApiBaseUrl();
  let taskId: string;

  describe('创建任务', () => {
    it('应该成功创建一个任务', () => {
      return request(baseUrl)
        .post('/task/create')
        .send({
          name: '测试任务',
          status: TaskStatus.TODO,
          tags: ['测试', 'e2e'],
          importance: 3,
          urgency: 4,
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('测试任务');
          taskId = res.body.data.id;
        });
    });
  });

  describe('获取任务详情', () => {
    it('应该成功获取任务详情', () => {
      return request(baseUrl)
        .get(`/task/detail/${taskId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(taskId);
          expect(res.body.data.name).toBe('测试任务');
        });
    });

    it('获取不存在的任务应该返回错误', () => {
      return request(baseUrl)
        .get('/task/detail/nonexistent-id')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).not.toBe(200);
        });
    });

    it('应该成功获取带时间跟踪的任务', () => {
      return request(baseUrl)
        .get(`/task/task-with-track-time/${taskId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(taskId);
          // 即使没有时间跟踪记录，trackTimeList应该是一个空数组
          expect(Array.isArray(res.body.data.trackTimeList)).toBeTruthy();
        });
    });
  });

  describe('更新任务', () => {
    it('应该成功更新任务', () => {
      return request(baseUrl)
        .put(`/task/update/${taskId}`)
        .send({
          name: '已更新的测试任务',
          status: TaskStatus.TODO,
          tags: ['测试', 'e2e', '已更新'],
          importance: 4,
          urgency: 5,
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('已更新的测试任务');
        });
    });
  });

  describe('任务状态操作', () => {
    it('应该成功完成任务', () => {
      return request(baseUrl)
        .put('/task/batch-done')
        .send({
          idList: [taskId],
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });

    it('应该成功恢复任务', () => {
      return request(baseUrl)
        .put(`/task/restore/${taskId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });

    it('应该成功放弃任务', () => {
      return request(baseUrl)
        .put(`/task/abandon/${taskId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });
  });

  describe('获取任务列表', () => {
    it('应该成功获取任务列表', () => {
      return request(baseUrl)
        .get('/task/list')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data.list)).toBeTruthy();
        });
    });

    it('应该成功获取任务分页列表', () => {
      return request(baseUrl)
        .get('/task/page?pageNum=1&pageSize=10')
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

  describe('删除任务', () => {
    it('应该成功删除任务', () => {
      return request(baseUrl)
        .delete(`/task/delete/${taskId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });
  });
}); 