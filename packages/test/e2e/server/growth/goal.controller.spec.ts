import request from 'supertest';
import { GoalStatus, GoalType } from '@life-toolkit/vo/growth';
import { getApiBaseUrl } from '../../../jest-e2e.setup';

describe('GoalController (e2e)', () => {
  const baseUrl = getApiBaseUrl();
  let goalId: string;

  describe('创建目标', () => {
    it('应该成功创建一个目标', () => {
      return request(baseUrl)
        .post('/goal/create')
        .send({
          name: '测试目标',
          status: GoalStatus.TODO,
          type: GoalType.OBJECTIVE,
          importance: 5,
          urgency: 4,
          startAt: new Date().toISOString(),
          endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('测试目标');
          goalId = res.body.data.id;
        });
    });
  });

  describe('获取目标详情', () => {
    it('应该成功获取目标详情', () => {
      return request(baseUrl)
        .get(`/goal/detail/${goalId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(goalId);
          expect(res.body.data.name).toBe('测试目标');
        });
    });

    it('获取不存在的目标应该返回错误', () => {
      return request(baseUrl)
        .get('/goal/detail/nonexistent-id')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).not.toBe(200);
        });
    });
  });

  describe('更新目标', () => {
    it('应该成功更新目标', () => {
      return request(baseUrl)
        .put(`/goal/update/${goalId}`)
        .send({
          name: '已更新的测试目标',
          status: GoalStatus.TODO,
          type: GoalType.OBJECTIVE,
          importance: 4,
          urgency: 3,
          description: '这是一个更新后的测试目标',
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('已更新的测试目标');
          expect(res.body.data.status).toBe(GoalStatus.TODO);
        });
    });
  });

  describe('目标状态操作', () => {
    it('应该成功完成目标', () => {
      return request(baseUrl)
        .put('/goal/batch-done')
        .send({
          idList: [goalId],
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });

    it('应该成功恢复目标', () => {
      return request(baseUrl)
        .put(`/goal/restore/${goalId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });

    it('应该成功放弃目标', () => {
      return request(baseUrl)
        .put(`/goal/abandon/${goalId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });
  });

  describe('获取目标列表', () => {
    it('应该成功获取目标列表', () => {
      return request(baseUrl)
        .get('/goal/list')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data.list)).toBeTruthy();
        });
    });

    it('应该成功获取目标分页列表', () => {
      return request(baseUrl)
        .get('/goal/page?pageNum=1&pageSize=10')
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

  describe('删除目标', () => {
    it('应该成功删除目标', () => {
      return request(baseUrl)
        .delete(`/goal/delete/${goalId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });
  });
}); 