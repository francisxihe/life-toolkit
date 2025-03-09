import { get, post, put, remove } from "../../core";
import type {
  CreateHabitLogVo,
  UpdateHabitLogVo,
  HabitLogVo,
} from "@life-toolkit/vo/growth/habit";

export default class HabitLogController {
  static async createHabitLog(params: CreateHabitLogVo) {
    return post<HabitLogVo>("/habit-log/create", params);
  }

  static async updateHabitLog(
    id: string,
    params: UpdateHabitLogVo
  ): Promise<HabitLogVo> {
    return put<HabitLogVo>(`/habit-log/update/${id}`, params);
  }

  static async getHabitLogDetail(id: string) {
    return get<HabitLogVo>(`/habit-log/detail/${id}`);
  }

  static async getHabitLogList(
    habitId: string
  ): Promise<{ list: HabitLogVo[] }> {
    return get<{ list: HabitLogVo[] }>(`/habit-log/list/${habitId}`);
  }

  static async deleteHabitLog(id: string) {
    return remove<boolean>(`/habit-log/delete/${id}`);
  }

  static async getHabitLogByDate(
    habitId: string,
    date: string
  ): Promise<HabitLogVo | null> {
    return get<HabitLogVo | null>(`/habit-log/by-date/${habitId}/${date}`);
  }

  static async getHabitLogsByDateRange(
    habitId: string,
    startDate: string,
    endDate: string
  ): Promise<{ list: HabitLogVo[] }> {
    return get<{ list: HabitLogVo[] }>(`/habit-log/date-range/${habitId}`, {
      params: { startDate, endDate },
    });
  }
}
