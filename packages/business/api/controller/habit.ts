import type { Habit as HabitVO } from '@life-toolkit/vo/growth';
import { request } from '@life-toolkit/share-request';

export default class HabitController {

  static async create(body: HabitVO.CreateHabitVo) {
    return request<HabitVO.HabitVo>({ method: "post" })(`/habit/create`, body);
  }

  static async delete(id: string) {
    return request<void>({ method: "remove" })(`/habit/delete/${id}`);
  }

  static async update(id: string, body: HabitVO.UpdateHabitVo) {
    return request<HabitVO.HabitVo>({ method: "put" })(`/habit/update/${id}`, body);
  }

  static async find(id: string) {
    return request<HabitVO.HabitVo>({ method: "get" })(`/habit/find/${id}`);
  }

  static async findAll(body: HabitVO.HabitFilterVo) {
    return request<HabitVO.HabitListVo>({ method: "get" })(`/habit/find-all`, body);
  }

  static async page(body: HabitVO.HabitPageFilterVo) {
    return request<HabitVO.HabitPageVo>({ method: "get" })(`/habit/page`, body);
  }

  static async updateStreak(id: string, body: { completed?: boolean }) {
    return request<any>({ method: "put" })(`/habit/update-streak/${id}`, body);
  }

  static async getHabitTodos(id: string) {
    return request<any>({ method: "get" })(`/habit/get-habit-todos/${id}`);
  }

  static async getHabitAnalytics(id: string) {
    return request<any>({ method: "get" })(`/habit/get-habit-analytics/${id}`);
  }

  static async doneBatch(body: { includeIds?: string[] }) {
    return request<any[]>({ method: "put" })(`/habit/done-batch`, body);
  }

  static async abandon(id: string) {
    return request<void>({ method: "put" })(`/habit/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<void>({ method: "put" })(`/habit/restore/${id}`);
  }

  static async pauseHabit(id: string) {
    return request<void>({ method: "put" })(`/habit/pause-habit/${id}`);
  }

  static async resumeHabit(id: string) {
    return request<void>({ method: "put" })(`/habit/resume-habit/${id}`);
  }
}
