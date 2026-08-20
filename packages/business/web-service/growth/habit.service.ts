import HabitController from '../controller/habit';
import type { Habit as HabitVO } from '@true-north/vo';
import { Message } from '../message';
import { MethodOptions } from '../type';

export default class HabitService {
  /**
   * create
   * @param createHabitVo 请求体数据
   * @returns 操作结果
   */
  static async create(createHabitVo: HabitVO.CreateHabitVo, options?: MethodOptions) {
    try {
      const res = await HabitController.create(createHabitVo);
      if (!options?.silent) {
        Message.success('创建成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  /**
   * delete
   * @param id idID
   * @returns 操作结果
   */
  static async delete(id: string, options?: MethodOptions) {
    try {
      const res = await HabitController.delete(id);
      if (!options?.silent) {
        Message.success('删除成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  /**
   * update
   * @param id idID
   * @param updateHabitVo 请求体数据
   * @returns 操作结果
   */
  static async update(id: string, updateHabitVo: HabitVO.UpdateHabitVo, options?: MethodOptions) {
    try {
      const res = await HabitController.update(id, updateHabitVo);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  /**
   * find
   * @param id idID
   * @returns 操作结果
   */
  static async find(id: string) {
    try {
      const res = await HabitController.find(id);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  /**
   * findByFilter
   * @param habitListFiltersVo 查询参数
   * @returns 操作结果
   */
  static async findByFilter(habitListFiltersVo?: HabitVO.HabitFilterVo) {
    try {
      const res = await HabitController.findByFilter(habitListFiltersVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  /**
   * page
   * @param habitPageFilterVo 查询参数
   * @returns 操作结果
   */
  static async page(habitPageFilterVo?: HabitVO.HabitPageFilterVo) {
    try {
      const res = await HabitController.page(habitPageFilterVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  /**
   * abandon
   * @param id idID
   * @returns 操作结果
   */
  static async abandon(id: string, options?: MethodOptions) {
    try {
      const res = await HabitController.abandon(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  /**
   * restore
   * @param id idID
   * @returns 操作结果
   */
  static async restore(id: string, options?: MethodOptions) {
    try {
      const res = await HabitController.restore(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async pause(id: string, options?: MethodOptions) {
    try {
      const res = await HabitController.pause(id);
      if (!options?.silent) Message.success('习惯已暂停');
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async activate(id: string, options?: MethodOptions) {
    try {
      const res = await HabitController.activate(id);
      if (!options?.silent) Message.success('习惯已开始');
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }
}
