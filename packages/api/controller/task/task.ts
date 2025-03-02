import { get, post, put, remove } from "../../core";
import {
  TaskVo,
  CreateTaskVo,
  TaskPageVo,
  TaskListVo,
  TaskWithChildrenVo,
  TaskPageFiltersVo,
  TaskListFiltersVo,
} from "@life-toolkit/vo/growth";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class TaskController {
  static async getTaskWithTrackTime(taskId: string) {
    return await get<TaskVo>(`/task/task-with-track-time/${taskId}`);
  }

  static async batchDoneTask(params: OperationByIdListVo) {
    return await put<TaskVo[]>(`/task/batch-done`, params);
  }

  static async restoreTask(id: string) {
    return await put(`/task/restore/${id}`);
  }

  static async abandonTask(id: string) {
    return await put(`/task/abandon/${id}`);
  }

  static async addTask(task: CreateTaskVo) {
    return await post<TaskVo>("/task/create", task);
  }

  static async deleteTask(id: string) {
    return await remove(`/task/delete/${id}`);
  }

  static async updateTask(id: string, task: Partial<CreateTaskVo>) {
    return await put<TaskVo>(`/task/update/${id}`, task);
  }

  static async getTaskList(params: TaskListFiltersVo = {}) {
    return await get<TaskListVo>("/task/list", params);
  }

  static async getTaskPage(params: TaskPageFiltersVo = {}) {
    return await get<TaskPageVo>("/task/page", params);
  }
}
