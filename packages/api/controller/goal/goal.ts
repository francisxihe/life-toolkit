import {
  post,
  put,
  get,
  remove,
  getElectronAPI,
  request,
} from "@life-toolkit/share-request";
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
    return request<GoalVo>({
      httpOperation: () => get<GoalVo>(`/goal/detail/${goalId}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.findDetail(goalId);
      },
    });
  }

  static async batchDoneGoal(params: OperationByIdListVo) {
    return request<GoalVo[]>({
      httpOperation: () => put<GoalVo[]>(`/goal/batch-done`, params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.batchDone(params).then(() => []);
      },
    });
  }

  static async restoreGoal(id: string) {
    return request<GoalVo>({
      httpOperation: () => put<GoalVo>(`/goal/restore/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.restore(id).then(() => ({} as GoalVo));
      },
    });
  }

  static async abandonGoal(id: string) {
    return request({
      httpOperation: () => put(`/goal/abandon/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.abandon(id);
      },
    });
  }

  static async addGoal(goal: CreateGoalVo) {
    return request<GoalVo>({
      httpOperation: () => post<GoalVo>("/goal/create", goal),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.create(goal);
      },
    });
  }

  static async deleteGoal(id: string) {
    return request<GoalVo>({
      httpOperation: () => remove<GoalVo>(`/goal/delete/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.delete(id).then(() => ({} as GoalVo));
      },
    });
  }

  static async updateGoal(id: string, goal: Partial<CreateGoalVo>) {
    return request({
      httpOperation: () => put<GoalVo>(`/goal/update/${id}`, goal),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.update(id, goal);
      },
    });
  }

  static async getGoalList(params: GoalListFiltersVo = {}) {
    return request<GoalListVo>({
      httpOperation: () => get<GoalListVo>("/goal/list", params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.list(params).then((list: GoalVo[]) => ({ list }));
      },
    });
  }

  static async getGoalTree(params: GoalListFiltersVo = {}) {
    return request<GoalVo[]>({
      httpOperation: () => get<GoalVo[]>("/goal/tree", params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.getTree(params);
      },
    });
  }

  static async getGoalPage(params: GoalPageFiltersVo = {}) {
    return request<GoalPageVo>({
      httpOperation: () => get<GoalPageVo>("/goal/page", params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.goal.page(params).then(result => ({
          ...result,
          pageNum: params.pageNum || 1,
          pageSize: params.pageSize || 10
        }));
      },
    });
  }
}
