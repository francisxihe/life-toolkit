import { Message } from '@arco-design/web-react';
import TodoController from '@life-toolkit/api/controller/todo/todo';
import type {
  CreateTodoVo,
  TodoPageFiltersVo,
  TodoListFiltersVo,
  UpdateTodoVo,
} from '@life-toolkit/vo/growth';
import { OperationByIdListVo } from '@life-toolkit/vo';

export default class TodoService {
  static async getTodo(todoId: string) {
    try {
      return TodoController.getTodo(todoId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async batchDoneTodo(params: OperationByIdListVo) {
    try {
      const res = await TodoController.batchDoneTodo(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreTodo(id: string) {
    try {
      const res = await TodoController.restoreTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonTodo(id: string) {
    try {
      const res = await TodoController.abandonTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addTodo(todo: CreateTodoVo) {
    try {
      const res = await TodoController.addTodo(todo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteTodo(id: string) {
    try {
      const res = await await TodoController.deleteTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateTodo(id: string, todo: UpdateTodoVo, silent = true) {
    try {
      const res = await TodoController.updateTodo(id, todo);
      if (!silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTodoList(params: TodoListFiltersVo = {}) {
    try {
      return TodoController.getTodoList(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTodoPage(params: TodoPageFiltersVo = {}) {
    try {
      return TodoController.getTodoPage(params);
    } catch (error) {
      Message.error(error.message);
    }
  }
}
