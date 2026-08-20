import { Habit as HabitVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { request } from '../request';

export default class HabitController {
  static async create(createHabitVo: HabitVO.CreateHabitVo) {
    return request<HabitVO.HabitVo>({ method: 'post' })(`/habit/create`, createHabitVo);
  }

  static async delete(id: string) {
    return request<void>({ method: 'remove' })(`/habit/delete/${id}`);
  }

  static async update(id: string, updateHabitVo: HabitVO.UpdateHabitVo) {
    return request<HabitVO.HabitVo>({ method: 'put' })(`/habit/update/${id}`, updateHabitVo);
  }

  static async find(id: string) {
    return request<HabitVO.HabitVo>({ method: 'get' })(`/habit/find/${id}`);
  }

  static async page(habitPageFilterVo?: HabitVO.HabitPageFilterVo) {
    return request<ResponsePageVo<HabitVO.HabitWithoutRelationsVo>>({ method: 'get' })(
      `/habit/page`,
      habitPageFilterVo
    );
  }

  static async abandon(id: string) {
    return request<void>({ method: 'put' })(`/habit/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<void>({ method: 'put' })(`/habit/restore/${id}`);
  }

  static async pause(id: string) {
    return request<void>({ method: 'put' })(`/habit/pause/${id}`);
  }

  static async activate(id: string) {
    return request<void>({ method: 'put' })(`/habit/activate/${id}`);
  }

  static async findByFilter(habitListFiltersVo?: HabitVO.HabitFilterVo) {
    return request<ResponseListVo<HabitVO.HabitWithoutRelationsVo>>({ method: 'get' })(
      `/habit/list`,
      habitListFiltersVo
    );
  }
}
