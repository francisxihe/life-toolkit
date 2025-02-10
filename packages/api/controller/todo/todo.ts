import { get, post, put, remove } from "../../core";
import {
  TodoVo,
  CreateTodoVo,
  TodoPageVo,
  TodoListVo,
  TodoWithSubVo,
  TodoPageFiltersVo,
  TodoListFiltersVo,
} from "@life-toolkit/vo/todo";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class TodoController {
  static async getTodoWithSub(todoId: string) {
    return await get<TodoWithSubVo>(`/todo/todo-with-sub/${todoId}`);
  }

  static async batchDoneTodo(params: OperationByIdListVo) {
    return await put<TodoVo[]>(`/todo/batch-done`, params);
  }

  static async restoreTodo(id: string) {
    return await put(`/todo/restore/${id}`);
  }

  static async abandonTodo(id: string) {
    return await put(`/todo/abandon/${id}`);
  }

  static async addTodo(todo: CreateTodoVo) {
    return await post<TodoVo>("/todo/create", todo);
  }

  static async deleteTodo(id: string) {
    return await remove(`/todo/delete/${id}`);
  }

  static async updateTodo(id: string, todo: Partial<CreateTodoVo>) {
    return await put<TodoVo>(`/todo/update/${id}`, todo);
  }

  static async getTodoList(params: TodoListFiltersVo = {}) {
    return await get<TodoListVo>("/todo/list", params);
  }

  static async getTodoPage(params: TodoPageFiltersVo = {}) {
    return await get<TodoPageVo>("/todo/page", params);
  }
}
