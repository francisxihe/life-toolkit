import request from 'supertest';
import { HabitStatus, HabitFrequency, HabitDifficulty } from '@life-toolkit/vo/growth/habit';
import { getApiBaseUrl } from '../../../../jest-e2e.setup';

describe('HabitController (e2e)', () => {
  const baseUrl = getApiBaseUrl();
  let habitId: string;

  describe('创建习惯', () => {
    it('应该成功创建一个习惯', () => {
      return request(baseUrl)
        .post('/habit/create')
        .send({
          name: '测试习惯',
          status: HabitStatus.ACTIVE,
          description: '这是一个测试习惯',
          importance: 3,
          tags: ['测试', 'e2e'],
          frequency: HabitFrequency.DAILY,
          difficulty: HabitDifficulty.MEDIUM,
          startDate: new Date().toISOString(),
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('测试习惯');
          habitId = res.body.data.id;
        });
    });
  });

  describe('获取习惯详情', () => {
    it('应该成功获取习惯详情', () => {
      return request(baseUrl)
        .get(`/habit/detail/${habitId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(habitId);
          expect(res.body.data.name).toBe('测试习惯');
        });
    });

    it('获取不存在的习惯应该返回错误', () => {
      return request(baseUrl)
        .get('/habit/detail/nonexistent-id')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).not.toBe(200);
        });
    });
  });

  describe('更新习惯', () => {
    it('应该成功更新习惯', () => {
      return request(baseUrl)
        .put(`/habit/update/${habitId}`)
        .send({
          name: '已更新的测试习惯',
          status: HabitStatus.ACTIVE,
          description: '这是一个更新后的测试习惯',
          importance: 4,
          tags: ['测试', 'e2e', '已更新'],
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.name).toBe('已更新的测试习惯');
        });
    });
  });

  describe('习惯状态操作', () => {
    it('应该成功完成习惯', () => {
      return request(baseUrl)
        .put('/habit/batch-complete')
        .send({
          idList: [habitId],
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });

    it('应该成功恢复习惯', () => {
      return request(baseUrl)
        .put(`/habit/restore/${habitId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });

    it('应该成功暂停习惯', () => {
      return request(baseUrl)
        .put(`/habit/pause/${habitId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });

    it('应该成功恢复暂停的习惯', () => {
      return request(baseUrl)
        .put(`/habit/resume/${habitId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });

    it('应该成功放弃习惯', () => {
      return request(baseUrl)
        .put(`/habit/abandon/${habitId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.result).toBeTruthy();
        });
    });
  });

  describe('获取习惯列表', () => {
    it('应该成功获取习惯列表', () => {
      return request(baseUrl)
        .get('/habit/list')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data.list)).toBeTruthy();
        });
    });

    it('应该成功获取习惯分页列表', () => {
      return request(baseUrl)
        .get('/habit/page?pageNum=1&pageSize=10')
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

  describe('删除习惯', () => {
    it('应该成功删除习惯', () => {
      return request(baseUrl)
        .delete(`/habit/delete/${habitId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });
  });
}); 