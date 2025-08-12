import { post, put, get, remove, request } from '@life-toolkit/share-request';
import {
  TodoVo,
  CreateTodoVo,
  TodoPageVo,
  TodoListVo,
  TodoPageFiltersVo,
  TodoListFiltersVo,
} from "@life-toolkit/vo/growth";
import { OperationByIdListVo } from "@life-toolkit/vo";

export default class TodoController {
  static async getTodo(todoId: string) {
    return request<TodoVo>({
      httpOperation: () => get<TodoVo>(`/todo/detail/${todoId}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.todo.findById(todoId);
      },
    });
  }

  static async batchDoneTodo(params: OperationByIdListVo) {
    return request<TodoVo[]>({
      httpOperation: () => put<TodoVo[]>(`/todo/batch-done`, params),
      electronOperation: async (electronAPI) => {
        await electronAPI.database.todo.batchDone(params);
        // 返回更新后的待办列表
        const todos = await Promise.all(params.idList.map((id: string) => electronAPI.database.todo.findById(id)));
        return todos.filter((todo: any) => todo !== null) as TodoVo[];
      },
    });
  }

  static async restoreTodo(id: string) {
    return request({
      httpOperation: () => put(`/todo/restore/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.todo.restore(id);
      },
    });
  }

  static async abandonTodo(id: string) {
    return request({
      httpOperation: () => put(`/todo/abandon/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.todo.abandon(id);
      },
    });
  }

  static async addTodo(todo: CreateTodoVo) {
    return request<TodoVo>({
      httpOperation: () => post<TodoVo>("/todo/create", todo),
      electronOperation: (electronAPI) => {
        return electronAPI.database.todo.create(todo);
      },
    });
  }

  static async deleteTodo(id: string) {
    return request({
      httpOperation: () => remove(`/todo/delete/${id}`),
      electronOperation: (electronAPI) => {
        return electronAPI.database.todo.delete(id);
      },
    });
  }

  static async updateTodo(id: string, todo: Partial<TodoVo>) {
    return request<TodoVo>({
      httpOperation: () => put<TodoVo>(`/todo/update/${id}`, todo),
      electronOperation: (electronAPI) => {
        return electronAPI.database.todo.update(id, todo);
      },
    });
  }

  static async getTodoList(params: TodoListFiltersVo = {}) {
    return request<TodoListVo>({
      httpOperation: () => get<TodoListVo>("/todo/list", params),
      electronOperation: (electronAPI) => {
        return electronAPI.database.todo.list(params).then((list: TodoVo[]) => ({ list }));
      },
    });
  }

  static async getTodoPage(params: any) {
    return request<TodoPageVo>({
      httpOperation: () => get<TodoPageVo>("/todo/page", params),
      electronOperation: async (electronAPI) => {
        const result = await electronAPI.database.todo.page(params);
        return {
          ...result,
          pageNum: params.pageNum || 1,
          pageSize: params.pageSize || 10,
        };
      },
    });
  }
}
