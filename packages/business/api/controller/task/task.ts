import { request } from "@life-toolkit/share-request";
import {
  Task as TaskVO,
  TaskVo,
  CreateTaskVo,
  TaskPageVo,
  TaskListVo,
  TaskPageFiltersVo,
  TaskListFiltersVo,
} from "@life-toolkit/vo/growth";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class TaskController {
  // ---------基础 CURD---------

  static async createTask(task: CreateTaskVo) {
    return request<TaskVo>({ method: "post" })(`/task/create`, task);
  }

  static async deleteTask(id: string) {
    return request({ method: "remove" })(`/task/delete/${id}`);
  }

  static async updateTask(id: string, task: Partial<CreateTaskVo>) {
    return request<TaskVo>({ method: "put" })(`/task/update/${id}`, task);
  }

  static async getTaskDetail(taskId: string) {
    return request<TaskVo>({ method: "get" })(`/task/detail/${taskId}`);
  }

  static async getTaskList(params: TaskListFiltersVo = {}) {
    return request<TaskListVo>({ method: "get" })("/task/list", params);
  }

  static async getTaskPage(params: TaskPageFiltersVo = {}) {
    return request<TaskPageVo>({ method: "get" })("/task/page", params);
  }

  // --------- 业务操作 ---------

  static async batchDoneTask(params: OperationByIdListVo) {
    return request<TaskVo[]>({ method: "put" })(`/task/batchDone`, params);
  }

  static async restoreTask(id: string) {
    return request<TaskVo>({ method: "put" })(`/task/restore/${id}`);
  }

  static async abandonTask(id: string) {
    return request<TaskVo>({ method: "put" })(`/task/abandon/${id}`);
  }

  static async getTaskTaskWithTrackTime(id: string) {
    return request<TaskVO.TaskVo>({ method: "get" })(`/task/task-with-track-time/${id}`);
  }
}
