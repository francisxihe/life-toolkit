import { get, post, put, remove } from "../../core";
import {
  SubTodoVo,
  CreateSubTodoVo,
  SubTodoWithSubVo,
  SubTodoListFilterVo,
  UpdateSubTodoVo,
} from "@life-toolkit/vo/todo";

export default class SubTodoController {
  static async addSubTodo(subTodo: CreateSubTodoVo) {
    return await post<SubTodoVo>("/sub-todo/create", subTodo);
  }

  static async getSubTodoWithSub(todoId: string) {
    return await get<SubTodoWithSubVo>(`/sub-todo/sub-todo-with-sub/${todoId}`);
  }

  static async restoreSubTodo(id: string) {
    return await put(`/sub-todo/restore/${id}`);
  }

  static async abandonSubTodo(id: string) {
    return await put(`/sub-todo/abandon/${id}`);
  }

  static async getSubTodoList(params: SubTodoListFilterVo) {
    return await get<SubTodoVo[]>(`/sub-todo/list`, params);
  }

  static async updateSubTodo(id: string, todo: Partial<UpdateSubTodoVo>) {
    return await put<SubTodoVo>(`/sub-todo/update/${id}`, todo);
  }
}
