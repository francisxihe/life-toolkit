import { get, post, put, remove } from "../../core";
import {
  TodoVO,
  CreateTodoVO,
  TodoPageVO,
  TodoListVO,
  TodoWithSubVO,
  TodoPageFiltersVO,
  TodoListFiltersVO,
} from "@life-toolkit/vo/todo/todo";

export default class TodoController {
  static async getTodoWithSub(todoId: string) {
    return await get<TodoWithSubVO>(`/todo/todo-with-sub/${todoId}`);
  }

  static async batchDoneTodo(idList: string[]) {
    return await put<TodoVO[]>(`/todo/batch-done`, { idList });
  }

  static async restoreTodo(id: string) {
    return await put(`/todo/restore/${id}`);
  }

  static async abandonTodo(id: string) {
    return await put(`/todo/abandon/${id}`);
  }

  static async addTodo(todo: CreateTodoVO) {
    return await post<TodoVO>("/todo/create", todo);
  }

  static async deleteTodo(id: string) {
    return await remove(`/todo/delete/${id}`);
  }

  static async updateTodo(id: string, todo: Partial<CreateTodoVO>) {
    return await put<TodoVO>(`/todo/update/${id}`, todo);
  }

  static async getTodoList(params: TodoListFiltersVO = {}) {
    return await get<TodoListVO>("/todo/list", params);
  }

  static async getTodoPage(params: TodoPageFiltersVO = {}) {
    return await get<TodoPageVO>("/todo/page", params);
  }
}
