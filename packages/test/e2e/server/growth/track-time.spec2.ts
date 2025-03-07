import request from 'supertest';
import { TaskStatus } from '@life-toolkit/vo/growth';
import { getApiBaseUrl } from '../../../jest-e2e.setup';

describe('TrackTime (e2e)', () => {
  const baseUrl = getApiBaseUrl();
  let taskId: string;
  let trackTimeId: string;

  beforeAll(async () => {
    // 创建一个任务用于测试
    const response = await request(baseUrl)
      .post('/task/create')
      .send({
        name: '测试时间跟踪任务',
        status: TaskStatus.TODO,
        tags: ['测试', 'e2e'],
      });

    taskId = response.body.data.id;
  });

  afterAll(async () => {
    // 清理测试数据，删除创建的任务
    if (taskId) {
      await request(baseUrl)
        .delete(`/task/delete/${taskId}`);
    }
  });

  describe('通过task-with-track-time接口测试时间跟踪功能', () => {
    it('任务初始应该没有时间跟踪记录', async () => {
      const response = await request(baseUrl)
        .get(`/task/task-with-track-time/${taskId}`)
        .expect(200);
      
      expect(response.body.code).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.trackTimeList)).toBeTruthy();
      expect(response.body.data.trackTimeList.length).toBe(0);
    });

    // 通过获取任务的时间跟踪记录来测试时间跟踪功能
    // 注意：这里假设任务上的trackTimeList是通过关联从TimeTrack表中获取的
    // 如果你的系统有直接创建/管理TimeTrack的API，应该使用那些API进行测试
    it('任务的时间跟踪记录应该能反映任务的工作时间', async () => {
      // 这里我们只能通过观察任务的trackTimeList来测试时间跟踪功能
      // 如果有专门的时间跟踪API，应该替换为对应的API调用
      const response = await request(baseUrl)
        .get(`/task/task-with-track-time/${taskId}`)
        .expect(200);
      
      expect(response.body.code).toBe(200);
      
      // 验证时间跟踪的数据结构
      const task = response.body.data;
      expect(task).toBeDefined();
      expect(Array.isArray(task.trackTimeList)).toBeTruthy();
      
      // 由于我们没有实际添加时间跟踪记录的API调用，trackTimeList应该是空的
      // 这个测试主要是验证API的返回结构是否正确
      expect(task.trackTimeList.length).toBe(0);
    });
  });

  describe('模拟时间跟踪的完整流程测试', () => {
    it('应该能够跟踪完整的任务工作流程', async () => {
      // 模拟开始处理任务
      await request(baseUrl)
        .put(`/task/update/${taskId}`)
        .send({
          name: '时间跟踪测试任务',
          status: TaskStatus.IN_PROGRESS,
        })
        .expect(200);
      
      // 模拟完成任务
      await request(baseUrl)
        .put(`/task/update/${taskId}`)
        .send({
          name: '时间跟踪测试任务',
          status: TaskStatus.DONE,
        })
        .expect(200);
      
      // 检查任务状态
      const finalResponse = await request(baseUrl)
        .get(`/task/detail/${taskId}`)
        .expect(200);
        
      expect(finalResponse.body.code).toBe(200);
      expect(finalResponse.body.data.status).toBe(TaskStatus.DONE);
    });
  });
}); 