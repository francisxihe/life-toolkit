import { request } from "@life-toolkit/share-request";
import {
  TodoVo,
  CreateTodoVo,
  TodoPageVo,
  TodoListVo,
  TodoListFiltersVo,
  UpdateTodoVo,
  TodoPageFiltersVo,
} from "@life-toolkit/vo/growth";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class TodoController {
  // -------- 基础CRUD --------

  static async createTodo(todo: CreateTodoVo) {
    return request<TodoVo>({ method: "post" })("/todo/create", todo);
  }

  static async deleteTodo(id: string) {
    return request({ method: "remove" })(`/todo/delete/${id}`);
  }

  static async updateTodo(id: string, todo: UpdateTodoVo) {
    return request<UpdateTodoVo>({ method: "put" })(`/todo/update/${id}`, todo);
  }

  static async getTodoDetailWithRepeat(todoId: string) {
    return request<TodoVo>({ method: "get" })(
      `/todo/detailWithRepeat/${todoId}`
    );
  }

  static async getTodoListWithRepeat(params: TodoListFiltersVo = {}) {
    return request<TodoListVo>({ method: "get" })(
      "/todo/listWithRepeat",
      params
    );
  }

  static async getTodoPage(params: TodoPageFiltersVo) {
    return request<TodoPageVo>({ method: "get" })("/todo/page", params);
  }

  // -------- 批量操作 --------

  static async batchDoneTodo(params: OperationByIdListVo) {
    return request<TodoVo[]>({ method: "put" })(`/todo/batchDone`, params);
  }

  static async restoreTodo(id: string) {
    return request({ method: "put" })(`/todo/restore/${id}`);
  }

  static async abandonTodo(id: string) {
    return request({ method: "put" })(`/todo/abandon/${id}`);
  }
}
