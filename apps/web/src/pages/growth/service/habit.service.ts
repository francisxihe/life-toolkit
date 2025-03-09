import { Message } from '@arco-design/web-react';
import { HabitController, HabitLogController } from '@life-toolkit/api/controller/habit';
import type {
  CreateHabitVo,
  UpdateHabitVo,
  CreateHabitLogVo,
  UpdateHabitLogVo,
} from '@life-toolkit/vo/growth/habit';
import { OperationByIdListVo } from '@life-toolkit/vo';
import { HabitFilter, HabitPageFilter } from './habit.types';
import { mapHabitFilterToParams, mapHabitPageFilterToParams } from './habit.mapping';

export default class HabitService {
  static async createHabit(params: CreateHabitVo) {
    try {
      const res = await HabitController.createHabit(params);
      Message.success('创建习惯成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateHabit(id: string, params: UpdateHabitVo) {
    try {
      const res = await HabitController.updateHabit(id, params);
      Message.success('更新习惯成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getHabitDetail(id: string) {
    try {
      return await HabitController.getHabitDetail(id);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getHabitList(filter: HabitFilter = {}) {
    try {
      const params = mapHabitFilterToParams(filter);
      return await HabitController.getHabitList(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getHabitPage(filter: HabitPageFilter = {}) {
    try {
      const params = mapHabitPageFilterToParams(filter);
      return await HabitController.getHabitPage(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteHabit(id: string) {
    try {
      const res = await HabitController.deleteHabit(id);
      Message.success('删除习惯成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async batchCompleteHabit(params: OperationByIdListVo) {
    try {
      const res = await HabitController.batchCompleteHabit(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonHabit(id: string) {
    try {
      const res = await HabitController.abandonHabit(id);
      Message.success('已放弃该习惯');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreHabit(id: string) {
    try {
      const res = await HabitController.restoreHabit(id);
      Message.success('已恢复该习惯');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async pauseHabit(id: string) {
    try {
      const res = await HabitController.pauseHabit(id);
      Message.success('已暂停该习惯');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async resumeHabit(id: string) {
    try {
      const res = await HabitController.resumeHabit(id);
      Message.success('已恢复该习惯');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  // 习惯日志相关方法
  static async createHabitLog(params: CreateHabitLogVo) {
    try {
      const res = await HabitLogController.createHabitLog(params);
      Message.success('记录习惯成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateHabitLog(id: string, params: UpdateHabitLogVo) {
    try {
      const res = await HabitLogController.updateHabitLog(id, params);
      Message.success('更新记录成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getHabitLogDetail(id: string) {
    try {
      return await HabitLogController.getHabitLogDetail(id);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getHabitLogList(habitId: string) {
    try {
      return await HabitLogController.getHabitLogList(habitId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteHabitLog(id: string) {
    try {
      const res = await HabitLogController.deleteHabitLog(id);
      Message.success('删除记录成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getHabitLogByDate(habitId: string, date: string) {
    try {
      return await HabitLogController.getHabitLogByDate(habitId, date);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getHabitLogsByDateRange(habitId: string, startDate: string, endDate: string) {
    try {
      return await HabitLogController.getHabitLogsByDateRange(habitId, startDate, endDate);
    } catch (error) {
      Message.error(error.message);
    }
  }
} 