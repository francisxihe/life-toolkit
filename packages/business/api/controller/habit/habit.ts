import type {
  CreateHabitVo,
  UpdateHabitVo,
  HabitVo,
  HabitListFiltersVo,
  HabitListVo,
  HabitPageFiltersVo,
  HabitPageVo,
} from '@life-toolkit/vo/growth';
import type { OperationByIdListVo } from '@life-toolkit/vo';
import { request } from '@life-toolkit/share-request';

export default class HabitController {
  static async createHabit(habit: CreateHabitVo) {
    return request<HabitVo>({ method: "post" })("/habit/create", habit);
  }

  static async updateHabit(id: string, habit: Partial<CreateHabitVo>) {
    return request<HabitVo>({ method: "put" })(`/habit/update/${id}`, habit);
  }

  static async getHabitDetail(habitId: string) {
    return request<HabitVo>({ method: "get" })(`/habit/findById/${habitId}`);
  }

  static async getHabitList(params: HabitListFiltersVo = {}) {
    return request<HabitListVo>({ method: "get" })("/habit/list", params);
  }

  static async getHabitPage(params: HabitPageFiltersVo = {}) {
    return request<HabitPageVo>({ method: "get" })("/habit/page", params);
  }

  static async deleteHabit(id: string) {
    return request({ method: "remove" })(`/habit/delete/${id}`);
  }

  static async batchCompleteHabit(params: OperationByIdListVo) {
    return request({ method: "put" })("/habit/batchDone", params);
  }

  static async abandonHabit(id: string) {
    return request({ method: "put" })(`/habit/abandon/${id}`);
  }

  static async restoreHabit(id: string) {
    return request({ method: "put" })(`/habit/restore/${id}`);
  }

  static async pauseHabit(id: string) {
    return request({ method: "put" })(`/habit/pause/${id}`);
  }

  static async resumeHabit(id: string) {
    return request({ method: "put" })(`/habit/resume/${id}`);
  }

  static async getHabitTodos(id: string) {
    return request<{
      activeTodos: any[];
      completedTodos: any[];
      abandonedTodos: any[];
      totalCount: number;
    }>({ method: "get" })(`/habit/getHabitTodos/${id}`);
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
    }>({ method: "get" })(`/habit/getHabitAnalytics/${id}`);
  }
}