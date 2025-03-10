import { Message } from '@arco-design/web-react';
import GoalController from '@life-toolkit/api/controller/goal/goal';
import type {
  CreateGoalVo,
  GoalPageFiltersVo,
  GoalListFiltersVo,
  UpdateGoalVo,
  GoalItemVo,
} from '@life-toolkit/vo/growth';
import { OperationByIdListVo } from '@life-toolkit/vo';
import { useState, useEffect } from 'react';
export default class GoalService {
  static async getDetail(todoId: string) {
    try {
      return GoalController.getDetail(todoId);
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async batchDoneGoal(params: OperationByIdListVo) {
    try {
      const res = await GoalController.batchDoneGoal(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async restoreGoal(id: string) {
    try {
      const res = await GoalController.restoreGoal(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonGoal(id: string) {
    try {
      const res = await GoalController.abandonGoal(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async addGoal(goal: CreateGoalVo) {
    try {
      const res = await GoalController.addGoal(goal);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async deleteGoal(id: string) {
    try {
      const res = await GoalController.deleteGoal(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async updateGoal(id: string, goal: UpdateGoalVo, silent = true) {
    try {
      const res = await GoalController.updateGoal(id, goal);
      if (!silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static async getGoalList(params: GoalListFiltersVo = {}) {
    try {
      return GoalController.getGoalList(params);
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }

  static useGoalList = (params: GoalListFiltersVo = {}) => {
    const [goalList, setGoalList] = useState<GoalItemVo[]>([]);
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

  static async getGoalPage(params: GoalPageFiltersVo = {}) {
    try {
      return GoalController.getGoalPage(params);
    } catch (error) {
      Message.error(error.message);
      throw error;
    }
  }
}
