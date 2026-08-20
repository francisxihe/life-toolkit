import { request } from '../request';
import { Todo as TodoVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { TodoRelatedType } from '@true-north/enum';

export default class TodoController {
  static async create(body: TodoVO.CreateTodoVo) {
    return request<TodoVO.TodoVo>({ method: 'post' })(`/todo/create`, body);
  }

  static async delete(relatedType: TodoRelatedType, id: string) {
    return request<boolean>({ method: 'remove' })(`/todo/delete/${relatedType}/${id}`);
  }

  static async update(relatedType: TodoRelatedType, id: string, body: TodoVO.UpdateTodoVo) {
    return request<TodoVO.TodoVo>({ method: 'put' })(`/todo/update/${relatedType}/${id}`, body);
  }

  static async page(query?: TodoVO.TodoPageFilterVo) {
    return request<ResponsePageVo<TodoVO.TodoWithoutRelationsVo>>({ method: 'get' })(`/todo/page`, query);
  }

  static async find(relatedType: TodoRelatedType, id: string) {
    return request<TodoVO.TodoVo>({ method: 'get' })(`/todo/find/${relatedType}/${id}`);
  }

  static async done(relatedType: TodoRelatedType, id: string, body?: { doneAt?: string }) {
    return request<any>({ method: 'put' })(`/todo/done/${relatedType}/${id}`, body);
  }

  static async abandon(relatedType: TodoRelatedType, id: string) {
    return request<boolean>({ method: 'put' })(`/todo/abandon/${relatedType}/${id}`);
  }

  static async restore(relatedType: TodoRelatedType, id: string) {
    return request<boolean>({ method: 'put' })(`/todo/restore/${relatedType}/${id}`);
  }

  static async list(query?: TodoVO.TodoFilterVo) {
    return request<ResponseListVo<TodoVO.TodoWithoutRelationsVo>>({ method: 'get' })(`/todo/list`, query);
  }

  static async doneBatch(body: TodoVO.TodoFilterVo) {
    return request<any>({ method: 'put' })(`/todo/done/batch`, body);
  }
}
