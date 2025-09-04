import { Message } from '@arco-design/web-react';
import { GoalController } from '@life-toolkit/api';
import type {
  CreateGoalVo,
  GoalPageFilterVo,
  GoalFilterVo,
  UpdateGoalVo,
  GoalModelVo,
  GoalVo,
} from '@life-toolkit/vo/growth';
import { OperationByIdListVo } from '@life-toolkit/vo';
import { useState, useEffect } from 'react';

export default class GoalService {
  static async getDetail(todoId: string) {
    try {
      return GoalController.find(todoId);
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async batchDoneGoal(params: OperationByIdListVo) {
    try {
      const res = await GoalController.doneBatch(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async restoreGoal(id: string) {
    try {
      const res = await GoalController.restore(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonGoal(id: string) {
    try {
      const res = await GoalController.abandon(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async createGoal(goal: CreateGoalVo) {
    try {
      const res = await GoalController.create(goal);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async deleteGoal(id: string) {
    try {
      const res = await GoalController.delete(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async updateGoal(id: string, goal: UpdateGoalVo, silent = true) {
    try {
      const res = await GoalController.update(id, goal);
      if (!silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async getGoalList(params: GoalFilterVo = {}) {
    try {
      return GoalController.findByFilter(params);
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async getGoalTree(params: GoalFilterVo = {}) {
    try {
      return GoalController.getTree(params);
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static useGoalList = (params: GoalFilterVo = {}) => {
    const [goalList, setGoalList] = useState<GoalModelVo[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGoalList = async () => {
      setLoading(true);
      const res = await GoalService.getGoalList(params);
      setGoalList(res.list);
      setLoading(false);
    };

    useEffect(() => {
      fetchGoalList();
    }, []);

    return { goalList, loading };
  };

  static async getGoalPage(params: GoalPageFilterVo = {}) {
    try {
      return GoalController.page(params);
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }
}
