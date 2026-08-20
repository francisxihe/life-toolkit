import { request } from '../request';
import { Task as TaskVO, ResponsePageVo, ResponseListVo } from '@true-north/vo';

export default class TaskController {
  static async create(createTaskVo: TaskVO.CreateTaskVo) {
    return request<TaskVO.TaskVo>({ method: 'post' })(`/task/create`, createTaskVo);
  }

  static async delete(id: string) {
    return request<boolean>({ method: 'remove' })(`/task/delete/${id}`);
  }

  static async update(id: string, body: TaskVO.UpdateTaskVo) {
    return request<TaskVO.TaskVo>({ method: 'put' })(`/task/update/${id}`, body);
  }

  static async find(id: string) {
    return request<TaskVO.TaskVo>({ method: 'get' })(`/task/find/${id}`);
  }

  static async page(taskPageFilterVo?: TaskVO.TaskPageFilterVo) {
    return request<ResponsePageVo<TaskVO.TaskWithoutRelationsVo>>({ method: 'get' })(`/task/page`, taskPageFilterVo);
  }

  static async taskWithRelations(id: string) {
    return request<TaskVO.TaskVo>({ method: 'get' })(`/task/task-with-relations/${id}`);
  }

  static async abandon(id: string) {
    return request<boolean>({ method: 'put' })(`/task/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<boolean>({ method: 'put' })(`/task/restore/${id}`);
  }

  static async findByFilter(taskListFiltersVo?: TaskVO.TaskFilterVo) {
    return request<ResponseListVo<TaskVO.TaskWithoutRelationsVo>>({ method: 'get' })(`/task/list`, taskListFiltersVo);
  }

  static async getTree(taskFilterVo?: TaskVO.TaskFilterVo) {
    return request<ResponseListVo<TaskVO.TaskVo>>({ method: 'get' })(`/task/tree`, taskFilterVo);
  }

  static async markDone(id: string) {
    return request<boolean>({ method: 'put' })(`/task/done/${id}`);
  }

  static async start(id: string) {
    return request<boolean>({ method: 'put' })(`/task/start/${id}`);
  }

  static async pause(id: string) {
    return request<boolean>({ method: 'put' })(`/task/pause/${id}`);
  }
}
