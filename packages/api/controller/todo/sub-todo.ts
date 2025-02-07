import { get, post, put, remove } from "../../core";
import {
  SubTodoVO,
  CreateSubTodoVO,
  SubTodoWithSubVO,
} from "@life-toolkit/vo/todo/sub-todo";

export default class SubTodoController {
  static async addSubTodo(subTodo: CreateSubTodoVO) {
    return await post<SubTodoVO>("/sub-todo/create", subTodo);
  }

  static async getSubTodoWithSub(todoId: string) {
    return await get<SubTodoWithSubVO>(`/sub-todo/sub-todo-with-sub/${todoId}`);
  }

  static async restoreSubTodo(id: string) {
    return await put(`/sub-todo/restore/${id}`);
  }

  static async abandonSubTodo(id: string) {
    return await put(`/sub-todo/abandon/${id}`);
  }
}
