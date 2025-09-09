import { request } from '@life-toolkit/share-request';
import { Todo as TodoVO, ResponseListVo, ResponsePageVo } from '@life-toolkit/vo';

export default class TodoController {
  static async create(body: TodoVO.CreateTodoVo) {
    return request<TodoVO.TodoVo>({ method: 'post' })(`/todo/create`, body);
  }

  static async delete(id: string) {
    return request<boolean>({ method: 'remove' })(`/todo/delete/${id}`);
  }

  static async update(id: string, body: TodoVO.UpdateTodoVo) {
    return request<TodoVO.TodoVo>({ method: 'put' })(`/todo/update/${id}`, body);
  }

  static async find(id: string) {
    return request<TodoVO.TodoVo>({ method: 'get' })(`/todo/find/${id}`);
  }

  static async findByFilter(params: TodoVO.TodoFilterVo) {
    return request<ResponseListVo<TodoVO.TodoWithoutRelationsVo>>({ method: 'get' })(`/todo/find-by-filter`, params);
  }

  static async page(params: TodoVO.TodoPageFilterVo) {
    return request<ResponsePageVo<TodoVO.TodoWithoutRelationsVo>>({ method: 'get' })(`/todo/page`, params);
  }

  static async listWithRepeat(params: TodoVO.TodoFilterVo) {
    return request<TodoVO.TodoListVo>({ method: 'get' })(`/todo/list-with-repeat`, params);
  }

  static async detailWithRepeat(id: string) {
    return request<TodoVO.TodoVo>({ method: 'get' })(`/todo/detail-with-repeat/${id}`);
  }

  static async doneWithRepeatBatch(body: TodoVO.TodoFilterVo) {
    return request<any>({ method: 'put' })(`/todo/done-with-repeat/batch`, body);
  }

  static async abandonWithRepeat(id: string) {
    return request<boolean>({ method: 'put' })(`/todo/abandon-with-repeat/${id}`);
  }

  static async restoreWithRepeat(id: string) {
    return request<boolean>({ method: 'put' })(`/todo/restore-with-repeat/${id}`);
  }
}
