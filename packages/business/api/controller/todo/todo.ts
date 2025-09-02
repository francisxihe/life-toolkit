import { request } from "@life-toolkit/share-request";
import { Todo as TodoVO } from "@life-toolkit/vo";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class TodoController {
  static async createTodo(body: TodoVO.CreateTodoVo) {
    return request<TodoVO.TodoVo>({ method: "post" })(`/todo/create`, body);
  }

  static async getTodoDetail(id: string) {
    return request<TodoVO.TodoVo>({ method: "get" })(`/todo/detail/${id}`);
  }

  static async updateTodo(id: string, body: TodoVO.UpdateTodoVo) {
    return request<TodoVO.TodoVo>({ method: "put" })(
      `/todo/update/${id}`,
      body
    );
  }

  static async deleteTodo(id: string) {
    return request<boolean>({ method: "remove" })(`/todo/delete/${id}`);
  }

  static async getTodoPage(params: TodoVO.TodoPageFiltersVo) {
    return request<TodoVO.TodoPageVo>({ method: "get" })(`/todo/page`, params);
  }

  static async getTodoList(params: TodoVO.TodoListFiltersVo) {
    return request<TodoVO.TodoListVo>({ method: "get" })(`/todo/list`, params);
  }

  static async batchTodo(body: TodoVO.TodoListFiltersVo) {
    return request({ method: "put" })(`/todo/done/batch`, body);
  }

  static async abandonTodo(id: string) {
    return request<boolean>({ method: "put" })(`/todo/abandon/${id}`);
  }

  static async restoreTodo(id: string) {
    return request<boolean>({ method: "put" })(`/todo/restore/${id}`);
  }

  static async doneTodo(id: string) {
    return request<boolean>({ method: "put" })(`/todo/done/${id}`);
  }

  static async getTodoListWithRepeat(params: TodoVO.TodoListFiltersVo) {
    return request<TodoVO.TodoListVo>({ method: "get" })(
      `/todo/listWithRepeat`,
      params
    );
  }

  static async getTodoDetailWithRepeat(id: string) {
    return request<TodoVO.TodoVo>({ method: "get" })(
      `/todo/detailWithRepeat/${id}`
    );
  }
}
