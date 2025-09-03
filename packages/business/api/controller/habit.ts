import type { Habit as HabitVO } from '@life-toolkit/vo/growth';
import { request } from '@life-toolkit/share-request';

export default class HabitController {

  static async create(body: HabitVO.CreateHabitVo) {
    return request({ method: "post" })(`/habit/create`, body);
  }

  static async delete(id: string) {
    return request({ method: "remove" })(`/habit/delete/${id}`);
  }

  static async update(id: string, body: HabitVO.UpdateHabitVo) {
    return request({ method: "put" })(`/habit/update/${id}`, body);
  }

  static async find(id: string) {
    return request({ method: "get" })(`/habit/find/${id}`);
  }

  static async findAll(body: HabitVO.HabitListFiltersVo) {
    return request({ method: "get" })(`/habit/find-all`, body);
  }

  static async page(body: HabitVO.HabitPageFiltersVo) {
    return request({ method: "get" })(`/habit/page`, body);
  }

  static async updateStreak(id: string, body: { completed?: boolean }) {
    return request({ method: "put" })(`/habit/update-streak/${id}`, body);
  }

  static async getHabitTodos(id: string) {
    return request({ method: "get" })(`/habit/get-habit-todos/${id}`);
  }

  static async getHabitAnalytics(id: string) {
    return request({ method: "get" })(`/habit/get-habit-analytics/${id}`);
  }

  static async doneBatch(body: { includeIds?: string[] }) {
    return request({ method: "put" })(`/habit/done-batch`, body);
  }

  static async abandon(id: string) {
    return request({ method: "put" })(`/habit/abandon/${id}`);
  }

  static async restore(id: string) {
    return request({ method: "put" })(`/habit/restore/${id}`);
  }

  static async pauseHabit(id: string) {
    return request({ method: "put" })(`/habit/pause-habit/${id}`);
  }

  static async resumeHabit(id: string) {
    return request({ method: "put" })(`/habit/resume-habit/${id}`);
  }
}
