import request from 'supertest';
import { HabitStatus, HabitFrequency, HabitDifficulty } from '@life-toolkit/vo/growth/habit';
import { getApiBaseUrl } from '../../../../jest-e2e.setup';

describe('HabitLogController (e2e)', () => {
  const baseUrl = getApiBaseUrl();
  let habitId: string;
  let habitLogId: string;
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  // 在测试前创建一个习惯
  beforeAll(async () => {
    const response = await request(baseUrl)
      .post('/habit/create')
      .send({
        name: '测试习惯日志',
        status: HabitStatus.ACTIVE,
        description: '这是一个用于测试习惯日志的习惯',
        importance: 3,
        tags: ['测试', 'e2e'],
        frequency: HabitFrequency.DAILY,
        difficulty: HabitDifficulty.MEDIUM,
        startDate: today.toISOString(),
      });

    habitId = response.body.data.id;
  });

  // 测试结束后删除创建的习惯
  afterAll(async () => {
    if (habitId) {
      await request(baseUrl).delete(`/habit/delete/${habitId}`);
    }
  });

  describe('创建习惯日志', () => {
    it('应该成功创建一个习惯日志', () => {
      return request(baseUrl)
        .post('/habit-log/create')
        .send({
          habitId,
          logDate: todayString,
          completionScore: 2,
          note: '今天完成得很好',
          mood: 5,
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.habitId).toBe(habitId);
          habitLogId = res.body.data.id;
        });
    });
  });

  describe('获取习惯日志详情', () => {
    it('应该成功获取习惯日志详情', () => {
      return request(baseUrl)
        .get(`/habit-log/detail/${habitLogId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(habitLogId);
          expect(res.body.data.habitId).toBe(habitId);
        });
    });

    it('获取不存在的习惯日志应该返回错误', () => {
      return request(baseUrl)
        .get('/habit-log/detail/nonexistent-id')
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).not.toBe(200);
        });
    });
  });

  describe('更新习惯日志', () => {
    it('应该成功更新习惯日志', () => {
      return request(baseUrl)
        .put(`/habit-log/update/${habitLogId}`)
        .send({
          completionScore: 1,
          note: '今天只完成了一部分',
          mood: 3,
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.completionScore).toBe(1);
          expect(res.body.data.note).toBe('今天只完成了一部分');
        });
    });
  });

  describe('按日期获取习惯日志', () => {
    it('应该成功按日期获取习惯日志', () => {
      return request(baseUrl)
        .get(`/habit-log/by-date/${habitId}/${todayString}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.habitId).toBe(habitId);
        });
    });
  });

  describe('获取习惯日志列表', () => {
    it('应该成功获取习惯日志列表', () => {
      return request(baseUrl)
        .get(`/habit-log/list/${habitId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data.list)).toBeTruthy();
          expect(res.body.data.list.length).toBeGreaterThan(0);
        });
    });
  });

  describe('按日期范围获取习惯日志', () => {
    it('应该成功按日期范围获取习惯日志', () => {
      // 创建一个月前的日期
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthAgoString = oneMonthAgo.toISOString().split('T')[0];

      return request(baseUrl)
        .get(`/habit-log/date-range/${habitId}`)
        .query({
          startDate: oneMonthAgoString,
          endDate: todayString,
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data.list)).toBeTruthy();
        });
    });
  });

  describe('删除习惯日志', () => {
    it('应该成功删除习惯日志', () => {
      return request(baseUrl)
        .delete(`/habit-log/delete/${habitLogId}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.code).toBe(200);
        });
    });
  });
}); 