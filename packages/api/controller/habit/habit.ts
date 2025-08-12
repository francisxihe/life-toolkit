import type {
  CreateHabitVo,
  UpdateHabitVo,
  HabitVo,
} from '@life-toolkit/vo/growth/habit';
import type { OperationByIdListVo } from '@life-toolkit/vo';
import { post, put, get, remove, request } from '@life-toolkit/share-request';

export default class HabitController {
  static async createHabit(params: CreateHabitVo) {
    return request<HabitVo>({
      httpOperation: () => post<HabitVo>('/habit', params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.create(params);
      },
    });
}
  static async updateHabit(id: string, params: UpdateHabitVo) {
    return request<HabitVo>({
      httpOperation: () => put<HabitVo>(`/habit/update/${id}`, params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.update(id, params);
      },
    });
  }

  static async getHabitDetail(id: string) {
    return request<HabitVo>({
      httpOperation: () => get<HabitVo>(`/habit/detail/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.findById(id);
      },
    });
  }

  static async getHabitList(params?: Record<string, any>) {
    return request<{ list: HabitVo[] }>({
      httpOperation: () => get<{ list: HabitVo[] }>('/habit/list', { params }),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.list(params).then((list: HabitVo[]) => ({ list }));
      },
    });
  }

  static async getHabitPage(pageNum: number, pageSize: number, params?: any) {
    return request<{
      list: HabitVo[];
      total: number;
      pageNum: number;
      pageSize: number;
    }>({
      httpOperation: () => get<{
        list: HabitVo[];
        total: number;
        pageNum: number;
        pageSize: number;
      }>('/habit/page', { pageNum, pageSize, ...params }),
      electronOperation: async (electronAPI) => {
        const result = await electronAPI.database.habit.page({ pageNum, pageSize, ...params });
        return {
          ...result,
          pageNum,
          pageSize,
        };
      },
    });
  }

  static async deleteHabit(id: string) {
    return request({
      httpOperation: () => remove(`/habit/delete/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.delete(id);
      },
    });
  }

  static async batchCompleteHabit(params: OperationByIdListVo) {
    return request({
      httpOperation: () => put('/habit/batch-complete', params),
      electronOperation: (electronAPI) => {
        // 批量完成习惯，可能需要循环调用单个完成方法
        return electronAPI.database.habit.batchDone(params);
      },
    });
  }

  static async abandonHabit(id: string) {
    return request({
      httpOperation: () => put(`/habit/abandon/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.abandon(id);
      },
    });
  }

  static async restoreHabit(id: string) {
    return request({
      httpOperation: () => put(`/habit/restore/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.restore(id);
      },
    });
  }

  static async pauseHabit(id: string) {
    return request({
      httpOperation: () => put(`/habit/pause/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.pause(id);
      },
    });
  }

  static async resumeHabit(id: string) {
    return request({
      httpOperation: () => put(`/habit/resume/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.resume(id);
      },
    });
  }

  static async getHabitTodos(id: string) {
    return request<{
      activeTodos: any[];
      completedTodos: any[];
      abandonedTodos: any[];
      totalCount: number;
    }>({
      httpOperation: () => get<{
        activeTodos: any[];
        completedTodos: any[];
        abandonedTodos: any[];
        totalCount: number;
      }>(`/habit/todos/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.getHabitTodos(id);
      },
    });
  }

  static async getHabitAnalytics(id: string) {
    return request<{
      totalTodos: number;
      completedTodos: number;
      abandonedTodos: number;
      completionRate: number;
      currentStreak: number;
      longestStreak: number;
      recentTodos: any[];
    }>({
      httpOperation: () => get<{
        totalTodos: number;
        completedTodos: number;
        abandonedTodos: number;
        completionRate: number;
        currentStreak: number;
        longestStreak: number;
        recentTodos: any[];
      }>(`/habit/analytics/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.habit.getHabitAnalytics(id);
      },
    });
  }
  }