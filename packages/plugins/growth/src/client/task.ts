import { pluginIpc } from './port';
import { Task as TaskVO, ResponsePageVo, ResponseListVo } from '@true-north/vo';

export default class TaskController {
  static async create(createTaskVo: TaskVO.CreateTaskVo) {
    return pluginIpc().post<TaskVO.TaskVo>(`/task/create`, createTaskVo);
  }

  static async delete(id: string) {
    return pluginIpc().remove<boolean>(`/task/delete/${id}`);
  }

  static async update(id: string, body: TaskVO.UpdateTaskVo) {
    return pluginIpc().put<TaskVO.TaskVo>(`/task/update/${id}`, body);
  }

  static async find(id: string) {
    return pluginIpc().get<TaskVO.TaskVo>(`/task/find/${id}`);
  }

  static async page(taskPageFilterVo?: TaskVO.TaskPageFilterVo) {
    return pluginIpc().get<ResponsePageVo<TaskVO.TaskWithoutRelationsVo>>(`/task/page`, taskPageFilterVo);
  }

  static async taskWithRelations(id: string) {
    return pluginIpc().get<TaskVO.TaskVo>(`/task/task-with-relations/${id}`);
  }

  static async abandon(id: string) {
    return pluginIpc().put<boolean>(`/task/abandon/${id}`);
  }

  static async restore(id: string) {
    return pluginIpc().put<boolean>(`/task/restore/${id}`);
  }

  static async findByFilter(taskListFiltersVo?: TaskVO.TaskFilterVo) {
    return pluginIpc().get<ResponseListVo<TaskVO.TaskWithoutRelationsVo>>(`/task/list`, taskListFiltersVo);
  }

  static async getTree(taskFilterVo?: TaskVO.TaskFilterVo) {
    return pluginIpc().get<ResponseListVo<TaskVO.TaskVo>>(`/task/tree`, taskFilterVo);
  }

  static async markDone(id: string) {
    return pluginIpc().put<boolean>(`/task/done/${id}`);
  }

  static async start(id: string) {
    return pluginIpc().put<boolean>(`/task/start/${id}`);
  }

  static async pause(id: string) {
    return pluginIpc().put<boolean>(`/task/pause/${id}`);
  }
}
