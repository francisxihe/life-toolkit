import { pluginIpc } from './port';
import { Todo as TodoVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { TodoRelatedType } from '@true-north/enum';

export default class TodoController {
  static async create(body: TodoVO.CreateTodoVo) {
    return pluginIpc().post<TodoVO.TodoVo>(`/todo/create`, body);
  }

  static async delete(relatedType: TodoRelatedType, id: string) {
    return pluginIpc().remove<boolean>(`/todo/delete/${relatedType}/${id}`);
  }

  static async update(relatedType: TodoRelatedType, id: string, body: TodoVO.UpdateTodoVo) {
    return pluginIpc().put<TodoVO.TodoVo>(`/todo/update/${relatedType}/${id}`, body);
  }

  static async page(query?: TodoVO.TodoPageFilterVo) {
    return pluginIpc().get<ResponsePageVo<TodoVO.TodoWithoutRelationsVo>>(`/todo/page`, query);
  }

  static async find(relatedType: TodoRelatedType, id: string) {
    return pluginIpc().get<TodoVO.TodoVo>(`/todo/find/${relatedType}/${id}`);
  }

  static async done(relatedType: TodoRelatedType, id: string, body?: { doneAt?: string }) {
    return pluginIpc().put<any>(`/todo/done/${relatedType}/${id}`, body);
  }

  static async abandon(relatedType: TodoRelatedType, id: string) {
    return pluginIpc().put<boolean>(`/todo/abandon/${relatedType}/${id}`);
  }

  static async restore(relatedType: TodoRelatedType, id: string) {
    return pluginIpc().put<boolean>(`/todo/restore/${relatedType}/${id}`);
  }

  static async list(query?: TodoVO.TodoFilterVo) {
    return pluginIpc().get<ResponseListVo<TodoVO.TodoWithoutRelationsVo>>(`/todo/list`, query);
  }

  static async doneBatch(body: TodoVO.TodoFilterVo) {
    return pluginIpc().put<any>(`/todo/done/batch`, body);
  }
}
