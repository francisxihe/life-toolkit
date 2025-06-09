import type {
  CreateHabitVo,
  UpdateHabitVo,
  HabitVo,
} from '@life-toolkit/vo/growth/habit';
import type { OperationByIdListVo } from '@life-toolkit/vo';
import { post, put, get, remove } from '../../core';

export default class HabitController {
  static async createHabit(params: CreateHabitVo) {
    return post<HabitVo>('/habit/create', params);
  }

  static async updateHabit(id: string, params: UpdateHabitVo) {
    return put<HabitVo>(`/habit/update/${id}`, params);
  }

  static async getHabitDetail(id: string) {
    return get<HabitVo>(`/habit/detail/${id}`);
  }

  static async getHabitList(params?: Record<string, any>) {
    return get<{ list: HabitVo[] }>('/habit/list', { params });
  }

  static async getHabitPage(params?: Record<string, any>) {
    return get<{
      list: HabitVo[];
      total: number;
      pageNum: number;
      pageSize: number;
    }>('/habit/page', { params });
  }

  static async deleteHabit(id: string) {
    return remove(`/habit/delete/${id}`);
  }

  static async batchCompleteHabit(params: OperationByIdListVo) {
    return put('/habit/batch-complete', params);
  }

  static async abandonHabit(id: string) {
    return put(`/habit/abandon/${id}`);
  }

  static async restoreHabit(id: string) {
    return put(`/habit/restore/${id}`);
  }

  static async pauseHabit(id: string) {
    return put(`/habit/pause/${id}`);
  }

  static async resumeHabit(id: string) {
    return put(`/habit/resume/${id}`);
  }

  static async getHabitTodos(id: string) {
    return get<{
      activeTodos: any[];
      completedTodos: any[];
      abandonedTodos: any[];
      totalCount: number;
    }>(`/habit/todos/${id}`);
  }

  static async getHabitAnalytics(id: string) {
    return get<{
      totalTodos: number;
      completedTodos: number;
      abandonedTodos: number;
      completionRate: number;
      currentStreak: number;
      longestStreak: number;
      recentTodos: any[];
    }>(`/habit/analytics/${id}`);
  }
} 