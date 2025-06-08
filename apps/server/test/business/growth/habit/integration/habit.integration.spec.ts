import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitModule } from '../../../../../src/business/growth/habit/habit.module';
import { Habit, HabitStatus, HabitFrequency, HabitDifficulty } from '../../../../../src/business/growth/habit/entities';
import { Goal } from '../../../../../src/business/growth/goal/entities';
import { TodoRepeat } from '../../../../../src/business/growth/todo/entities';
import type { Habit as HabitVo } from '@life-toolkit/vo';

describe('Habit Integration Tests', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Habit, Goal, TodoRepeat],
          synchronize: true,
          logging: false,
        }),
        HabitModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/habit (POST)', () => {
    it('should create a new habit', async () => {
      const createHabitVo: HabitVo.CreateHabitVo = {
        name: '每天阅读30分钟',
        description: '培养阅读习惯，提升知识储备',
        importance: 4,
        tags: ['学习', '阅读'],
        frequency: HabitFrequency.DAILY,
        difficulty: HabitDifficulty.MEDIUM,
        needReminder: true,
        reminderTime: '20:00',
        autoCreateTodo: true,
      };

      const response = await request(app.getHttpServer())
        .post('/habit/create')
        .send(createHabitVo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: '每天阅读30分钟',
        description: '培养阅读习惯，提升知识储备',
        importance: 4,
        tags: ['学习', '阅读'],
        frequency: HabitFrequency.DAILY,
        difficulty: HabitDifficulty.MEDIUM,
        status: HabitStatus.ACTIVE,
        needReminder: true,
        reminderTime: '20:00',
        autoCreateTodo: true,
        currentStreak: 0,
        longestStreak: 0,
        completedCount: 0,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidHabit = {
        description: '缺少名称的习惯',
      };

      await request(app.getHttpServer())
        .post('/habit/create')
        .send(invalidHabit)
        .expect(400);
    });

    it('should validate field constraints', async () => {
      const invalidHabit: Partial<HabitVo.CreateHabitVo> = {
        name: '有效名称',
        importance: 10, // 超出范围 (1-5)
        reminderTime: '25:00', // 无效时间格式
      };

      await request(app.getHttpServer())
        .post('/habit/create')
        .send(invalidHabit)
        .expect(400);
    });
  });

  describe('/habit/detail/:id (GET)', () => {
    let habitId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/habit/create')
        .send({
          name: '测试习惯',
          frequency: HabitFrequency.DAILY,
          difficulty: HabitDifficulty.EASY,
        });
      habitId = createResponse.body.data.id;
    });

    it('should return habit details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/habit/detail/${habitId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: habitId,
        name: '测试习惯',
        frequency: HabitFrequency.DAILY,
        difficulty: HabitDifficulty.EASY,
        status: HabitStatus.ACTIVE,
      });
    });

    it('should return 404 for non-existent habit', async () => {
      await request(app.getHttpServer())
        .get('/habit/detail/non-existent-id')
        .expect(404);
    });
  });

  describe('/habit/update/:id (PUT)', () => {
    let habitId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/habit/create')
        .send({
          name: '原始习惯',
          importance: 3,
          frequency: HabitFrequency.DAILY,
        });
      habitId = createResponse.body.data.id;
    });

    it('should update habit successfully', async () => {
      const updateData: HabitVo.UpdateHabitVo = {
        name: '更新后的习惯',
        importance: 5,
        description: '新增的描述',
      };

      const response = await request(app.getHttpServer())
        .put(`/habit/update/${habitId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: habitId,
        name: '更新后的习惯',
        importance: 5,
        description: '新增的描述',
      });
    });

    it('should return 404 for non-existent habit', async () => {
      await request(app.getHttpServer())
        .put('/habit/update/non-existent-id')
        .send({ name: '更新名称' })
        .expect(404);
    });
  });

  describe('/habit/list (GET)', () => {
    beforeEach(async () => {
      // 创建测试数据
      await request(app.getHttpServer())
        .post('/habit/create')
        .send({
          name: '阅读习惯',
          tags: ['学习', '阅读'],
          status: HabitStatus.ACTIVE,
        });

      await request(app.getHttpServer())
        .post('/habit/create')
        .send({
          name: '运动习惯',
          tags: ['健康', '运动'],
          status: HabitStatus.PAUSED,
        });

      await request(app.getHttpServer())
        .post('/habit/create')
        .send({
          name: '冥想习惯',
          tags: ['心理', '冥想'],
          status: HabitStatus.ACTIVE,
        });
    });

    it('should return all habits', async () => {
      const response = await request(app.getHttpServer())
        .get('/habit/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.list).toHaveLength(3);
    });

    it('should filter habits by keyword', async () => {
      const response = await request(app.getHttpServer())
        .get('/habit/list?keyword=阅读')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.list).toHaveLength(1);
      expect(response.body.data.list[0].name).toContain('阅读');
    });

    it('should filter habits by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/habit/list?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.list).toHaveLength(2);
      response.body.data.list.forEach((habit: any) => {
        expect(habit.status).toBe(HabitStatus.ACTIVE);
      });
    });
  });

  describe('/habit/page (GET)', () => {
    beforeEach(async () => {
      // 创建15个测试习惯
      for (let i = 1; i <= 15; i++) {
        await request(app.getHttpServer())
          .post('/habit/create')
          .send({
            name: `习惯${i}`,
            importance: (i % 5) + 1,
          });
      }
    });

    it('should return paginated results', async () => {
      const response = await request(app.getHttpServer())
        .get('/habit/page?page=1&pageSize=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.list).toHaveLength(10);
      expect(response.body.data.total).toBe(15);
      expect(response.body.data.pageNum).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
    });

    it('should return second page', async () => {
      const response = await request(app.getHttpServer())
        .get('/habit/page?page=2&pageSize=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.list).toHaveLength(5);
      expect(response.body.data.pageNum).toBe(2);
    });
  });

  describe('Status Operations', () => {
    let habitId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/habit/create')
        .send({
          name: '状态测试习惯',
          status: HabitStatus.ACTIVE,
        });
      habitId = createResponse.body.data.id;
    });

    it('should pause habit', async () => {
      const response = await request(app.getHttpServer())
        .put(`/habit/pause/${habitId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证状态已更改
      const detailResponse = await request(app.getHttpServer())
        .get(`/habit/detail/${habitId}`)
        .expect(200);

      expect(detailResponse.body.data.status).toBe(HabitStatus.PAUSED);
    });

    it('should resume habit', async () => {
      // 先暂停
      await request(app.getHttpServer())
        .put(`/habit/pause/${habitId}`)
        .expect(200);

      // 再恢复
      const response = await request(app.getHttpServer())
        .put(`/habit/resume/${habitId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证状态已更改
      const detailResponse = await request(app.getHttpServer())
        .get(`/habit/detail/${habitId}`)
        .expect(200);

      expect(detailResponse.body.data.status).toBe(HabitStatus.ACTIVE);
    });

    it('should abandon habit', async () => {
      const response = await request(app.getHttpServer())
        .put(`/habit/abandon/${habitId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证状态已更改
      const detailResponse = await request(app.getHttpServer())
        .get(`/habit/detail/${habitId}`)
        .expect(200);

      expect(detailResponse.body.data.status).toBe(HabitStatus.ABANDONED);
    });

    it('should restore habit', async () => {
      // 先放弃
      await request(app.getHttpServer())
        .put(`/habit/abandon/${habitId}`)
        .expect(200);

      // 再恢复
      const response = await request(app.getHttpServer())
        .put(`/habit/restore/${habitId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证状态已更改
      const detailResponse = await request(app.getHttpServer())
        .get(`/habit/detail/${habitId}`)
        .expect(200);

      expect(detailResponse.body.data.status).toBe(HabitStatus.ACTIVE);
    });
  });

  describe('/habit/batch-complete (PUT)', () => {
    let habitIds: string[];

    beforeEach(async () => {
      habitIds = [];
      for (let i = 1; i <= 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/habit/create')
          .send({
            name: `批量测试习惯${i}`,
            status: HabitStatus.ACTIVE,
          });
        habitIds.push(response.body.data.id);
      }
    });

    it('should complete multiple habits', async () => {
      const response = await request(app.getHttpServer())
        .put('/habit/batch-complete')
        .send({ idList: habitIds })
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证所有习惯状态已更改
      for (const habitId of habitIds) {
        const detailResponse = await request(app.getHttpServer())
          .get(`/habit/detail/${habitId}`)
          .expect(200);

        expect(detailResponse.body.data.status).toBe(HabitStatus.COMPLETED);
      }
    });
  });

  describe('/habit/delete/:id (DELETE)', () => {
    let habitId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/habit/create')
        .send({
          name: '待删除习惯',
        });
      habitId = createResponse.body.data.id;
    });

    it('should delete habit successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/habit/delete/${habitId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 验证习惯已被删除
      await request(app.getHttpServer())
        .get(`/habit/detail/${habitId}`)
        .expect(404);
    });
  });
}); 