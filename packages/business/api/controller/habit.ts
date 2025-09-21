import type { Habit as HabitVO, ResponseListVo, ResponsePageVo } from '@life-toolkit/vo';
import { request } from '@life-toolkit/share-request';

export default class HabitController {
  static async create(body: HabitVO.CreateHabitVo) {
    return request<HabitVO.HabitVo>({ method: 'post' })(`/habit/create`, body);
  }

  static async delete(id: string) {
    return request<void>({ method: 'remove' })(`/habit/delete/${id}`);
  }

  static async update(id: string, body: HabitVO.UpdateHabitVo) {
    return request<HabitVO.HabitVo>({ method: 'put' })(`/habit/update/${id}`, body);
  }

  static async find(id: string) {
    return request<HabitVO.HabitVo>({ method: 'get' })(`/habit/find/${id}`);
  }

  static async findByFilter(body: HabitVO.HabitFilterVo) {
    return request<ResponseListVo<HabitVO.HabitWithoutRelationsVo>>({ method: 'get' })(`/habit/find-by-filter`, body);
  }

  static async page(body: HabitVO.HabitPageFilterVo) {
    return request<ResponsePageVo<HabitVO.HabitWithoutRelationsVo>>({ method: 'get' })(`/habit/page`, body);
  }

  static async getHabitTodos(id: string) {
    return request<any>({ method: 'get' })(`/habit/get-habit-todos/${id}`);
  }

  static async getHabitAnalytics(id: string) {
    return request<any>({ method: 'get' })(`/habit/get-habit-analytics/${id}`);
  }

  static async doneBatch(body: { includeIds?: string[] }) {
    return request<any[]>({ method: 'put' })(`/habit/done/batch`, body);
  }

  static async abandon(id: string) {
    return request<void>({ method: 'put' })(`/habit/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<void>({ method: 'put' })(`/habit/restore/${id}`);
  }

  static async pauseHabit(id: string) {
    return request<void>({ method: 'put' })(`/habit/pause-habit/${id}`);
  }

  static async resumeHabit(id: string) {
    return request<void>({ method: 'put' })(`/habit/resume-habit/${id}`);
  }
}
