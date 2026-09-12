import { Habit as HabitVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { pluginIpc } from './port';

export default class HabitController {
  static async create(createHabitVo: HabitVO.CreateHabitVo) {
    return pluginIpc().post<HabitVO.HabitVo>(`/habit/create`, createHabitVo);
  }

  static async delete(id: string) {
    return pluginIpc().remove<void>(`/habit/delete/${id}`);
  }

  static async update(id: string, updateHabitVo: HabitVO.UpdateHabitVo) {
    return pluginIpc().put<HabitVO.HabitVo>(`/habit/update/${id}`, updateHabitVo);
  }

  static async find(id: string) {
    return pluginIpc().get<HabitVO.HabitVo>(`/habit/find/${id}`);
  }

  static async page(habitPageFilterVo?: HabitVO.HabitPageFilterVo) {
    return pluginIpc().get<ResponsePageVo<HabitVO.HabitWithoutRelationsVo>>(`/habit/page`,
      habitPageFilterVo);
  }

  static async abandon(id: string) {
    return pluginIpc().put<void>(`/habit/abandon/${id}`);
  }

  static async restore(id: string) {
    return pluginIpc().put<void>(`/habit/restore/${id}`);
  }

  static async pause(id: string) {
    return pluginIpc().put<void>(`/habit/pause/${id}`);
  }

  static async activate(id: string) {
    return pluginIpc().put<void>(`/habit/activate/${id}`);
  }

  static async findByFilter(habitListFiltersVo?: HabitVO.HabitFilterVo) {
    return pluginIpc().get<ResponseListVo<HabitVO.HabitWithoutRelationsVo>>(`/habit/list`,
      habitListFiltersVo);
  }
}
