import { request } from '@life-toolkit/share-request';
import { Task as TaskVO } from '@life-toolkit/vo/growth';

export default class TaskController {

  static async create(body: TaskVO.CreateTaskVo) {
    return request<TaskVO.TaskVo>({ method: "post" })(`/task/create`, body);
  }

  static async delete(id: string) {
    return request<boolean>({ method: "remove" })(`/task/delete/${id}`);
  }

  static async update(id: string, body: TaskVO.UpdateTaskVo) {
    return request<TaskVO.TaskVo>({ method: "put" })(`/task/update/${id}`, body);
  }

  static async find(id: string) {
    return request<TaskVO.TaskVo>({ method: "get" })(`/task/find/${id}`);
  }

  static async findAll(body: TaskVO.TaskListFiltersVo) {
    return request<TaskVO.TaskListVo>({ method: "get" })(`/task/find-all`, body);
  }

  static async page(body: TaskVO.TaskPageFiltersVo) {
    return request<TaskVO.TaskPageVo>({ method: "get" })(`/task/page`, body);
  }

  static async taskWithTrackTime(id: string) {
    return request<TaskVO.TaskVo>({ method: "get" })(`/task/task-with-track-time/${id}`);
  }

  static async abandon(id: string) {
    return request<boolean>({ method: "put" })(`/task/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<boolean>({ method: "put" })(`/task/restore/${id}`);
  }
}
