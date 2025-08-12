import { post, put, get, remove, request } from '@life-toolkit/share-request';
import {
  TaskVo,
  CreateTaskVo,
  TaskPageVo,
  TaskListVo,
  TaskPageFiltersVo,
  TaskListFiltersVo,
} from "@life-toolkit/vo/growth";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class TaskController {
  static async getTaskWithTrackTime(taskId: string) {
    return request<TaskVo>({
      httpOperation: () => get<TaskVo>(`/task/task-with-track-time/${taskId}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.task.taskWithTrackTime(taskId);
      },
    });
  }

  static async batchDoneTask(params: OperationByIdListVo) {
    return request<TaskVo[]>({
      httpOperation: () => put<TaskVo[]>(`/task/batch-done`, params),
      electronOperation: async (electronAPI) => {
        await electronAPI.database.task.batchDone(params);
        // 返回更新后的任务列表
        const tasks = await Promise.all(params.idList.map((id: string) => electronAPI.database.task.findById(id)));
        return tasks.filter((task: any) => task !== null) as TaskVo[];
      },
    });
  }

  static async restoreTask(id: string) {
    return request({
      httpOperation: () => put(`/task/restore/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.task.restore(id);
      },
    });
  }

  static async abandonTask(id: string) {
    return request({
      httpOperation: () => put(`/task/abandon/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.task.abandon(id);
      },
    });
  }

  static async addTask(task: CreateTaskVo) {
    return request<TaskVo>({
      httpOperation: () => post<TaskVo>("/task/create", task),
      electronOperation: (electronAPI) => {
        return electronAPI.database.task.create(task);
      },
    });
  }

  static async deleteTask(id: string) {
    return request({
      httpOperation: () => remove(`/task/delete/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.task.delete(id);
      },
    });
  }

  static async updateTask(id: string, task: Partial<CreateTaskVo>) {
    return request<TaskVo>({
      httpOperation: () => put<TaskVo>(`/task/update/${id}`, task),
      electronOperation: (electronAPI) => {
        return electronAPI.database.task.update(id, task);
      },
    });
  }

  static async getTaskList(params: TaskListFiltersVo = {}) {
    return request<TaskListVo>({
      httpOperation: () => get<TaskListVo>("/task/list", params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.task.list(params).then((list: TaskVo[]) => ({ list }));
      },
    });
  }

  static async getTaskPage(params: TaskPageFiltersVo = {}) {
    return request<TaskPageVo>({
      httpOperation: () => get<TaskPageVo>("/task/page", params),
      electronOperation: async (electronAPI) => {
        const result = await electronAPI.database.task.page(params);
        return {
          ...result,
          pageNum: params.pageNum || 1,
          pageSize: params.pageSize || 10,
        };
      },
    });
  }
}
