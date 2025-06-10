import { get, post, put, remove } from "../../core";
import {
  GoalVo,
  CreateGoalVo,
  GoalPageVo,
  GoalListVo,
  GoalPageFiltersVo,
  GoalListFiltersVo,
} from "@life-toolkit/vo/growth";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class GoalController {
  static async getDetail(goalId: string) {
    return await get<GoalVo>(`/goal/detail/${goalId}`);
  }

  static async batchDoneGoal(params: OperationByIdListVo) {
    return await put<GoalVo[]>(`/goal/batch-done`, params);
  }

  static async restoreGoal(id: string) {
    return await put(`/goal/restore/${id}`);
  }

  static async abandonGoal(id: string) {
    return await put(`/goal/abandon/${id}`);
  }

  static async addGoal(goal: CreateGoalVo) {
    return await post<GoalVo>("/goal/create", goal);
  }

  static async deleteGoal(id: string) {
    return await remove(`/goal/delete/${id}`);
  }

  static async updateGoal(id: string, goal: Partial<CreateGoalVo>) {
    return await put<GoalVo>(`/goal/update/${id}`, goal);
  }

  static async getGoalList(params: GoalListFiltersVo = {}) {
    return await get<GoalListVo>("/goal/list", params);
  }

  static async getGoalPage(params: GoalPageFiltersVo = {}) {
    const res = await get<GoalPageVo>("/goal/page", params);
    return res;
  }
}
