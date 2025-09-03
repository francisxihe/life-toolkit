import { request } from '@life-toolkit/share-request';
import { Todo as TodoVO } from '@life-toolkit/vo';

export default class TodoController {

  static async create(body: TodoVO.CreateTodoVo) {
    return request<TodoVO.TodoVo>({ method: "post" })(`/todo/create`, body);
  }

  static async delete(id: string) {
    return request<boolean>({ method: "remove" })(`/todo/delete/${id}`);
  }

  static async update(id: string, body: TodoVO.UpdateTodoVo) {
    return request<TodoVO.TodoVo>({ method: "put" })(`/todo/update/${id}`, body);
  }

  static async find(id: string) {
    return request<TodoVO.TodoVo>({ method: "get" })(`/todo/find/${id}`);
  }

  static async findAll(params: TodoVO.TodoFilterVo) {
    return request<TodoVO.TodoListVo>({ method: "get" })(`/todo/find-all`, params);
  }

  static async page(params: TodoVO.TodoPageFilterVo) {
    return request<TodoVO.TodoPageVo>({ method: "get" })(`/todo/page`, params);
  }

  static async doneBatch(body: TodoVO.TodoFilterVo) {
    return request<any>({ method: "put" })(`/todo/done-batch`, body);
  }

  static async abandon(id: string) {
    return request<boolean>({ method: "put" })(`/todo/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<boolean>({ method: "put" })(`/todo/restore/${id}`);
  }

  static async done(id: string) {
    return request<boolean>({ method: "put" })(`/todo/done/${id}`);
  }

  static async listWithRepeat(params: TodoVO.TodoFilterVo) {
    return request<TodoVO.TodoListVo>({ method: "get" })(`/todo/list-with-repeat`, params);
  }

  static async detailWithRepeat(id: string) {
    return request<TodoVO.TodoVo>({ method: "get" })(`/todo/detail-with-repeat/${id}`);
  }
}
