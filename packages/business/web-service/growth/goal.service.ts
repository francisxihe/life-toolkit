import GoalController from '../controller/goal';
import type { Goal as GoalVO } from '@true-north/vo';
import { Message } from '../message';
import { MethodOptions } from '../type';

export default class GoalService {
  static async create(body: GoalVO.CreateGoalVo, options?: MethodOptions) {
    try {
      const res = await GoalController.create(body);
      if (!options?.silent) {
        Message.success('创建成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async delete(id: string, options?: MethodOptions) {
    try {
      const res = await GoalController.delete(id);
      if (!options?.silent) {
        Message.success('删除成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async update(id: string, updateGoalVo: GoalVO.UpdateGoalVo, options?: MethodOptions) {
    try {
      const res = await GoalController.update(id, updateGoalVo);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async find(id: string) {
    try {
      const res = await GoalController.find(id);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async findByFilter(goalListFiltersVo?: GoalVO.GoalFilterVo) {
    try {
      const res = await GoalController.findByFilter(goalListFiltersVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async page(goalPageFilterVo?: GoalVO.GoalPageFilterVo) {
    try {
      const res = await GoalController.page(goalPageFilterVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async getTree(goalListFiltersVo?: GoalVO.GoalFilterVo) {
    try {
      const res = await GoalController.getTree(goalListFiltersVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async findRoots() {
    try {
      const res = await GoalController.findRoots();
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async findChildren(parentId: string) {
    try {
      const res = await GoalController.findChildren(parentId);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async abandon(id: string, options?: MethodOptions) {
    try {
      const res = await GoalController.abandon(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async restore(id: string, options?: MethodOptions) {
    try {
      const res = await GoalController.restore(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async markDone(id: string, options?: MethodOptions) {
    try {
      const res = await GoalController.markDone(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }
}
