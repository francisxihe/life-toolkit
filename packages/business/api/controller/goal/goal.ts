import { request } from "@life-toolkit/share-request";
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
    return request<GoalVo>({ method: "get" })(`/goal/findById/${goalId}`);
  }

  static async batchDoneGoal(params: OperationByIdListVo) {
    return request<GoalVo[]>({ method: "put" })("/goal/batchDone", params);
  }

  static async restoreGoal(id: string) {
    return request<GoalVo>({ method: "put" })(`/goal/restore/${id}`);
  }

  static async abandonGoal(id: string) {
    return request({ method: "put" })(`/goal/abandon/${id}`);
  }

  static async addGoal(goal: CreateGoalVo) {
    return request<GoalVo>({ method: "post" })("/goal/create", goal);
  }

  static async deleteGoal(id: string) {
    return request<GoalVo>({ method: "remove" })(`/goal/delete/${id}`);
  }

  static async updateGoal(id: string, goal: Partial<CreateGoalVo>) {
    return request({ method: "put" })(`/goal/update/${id}`, goal);
  }

  static async getGoalList(params: GoalListFiltersVo = {}) {
    return request<GoalListVo>({ method: "get" })("/goal/list", params);
  }

  static async getGoalTree(params: GoalListFiltersVo = {}) {
    return request<GoalVo[]>({ method: "get" })("/goal/tree", params);
  }

  static async getGoalPage(params: GoalPageFiltersVo = {}) {
    return request<GoalPageVo>({ method: "get" })("/goal/page", params);
  }
}
