import { Message } from '@arco-design/web-react';
import TodoController from '@life-toolkit/api/controller/todo/todo';
import SubTodoController from '@life-toolkit/api/controller/todo/sub-todo';
import {
  CreateTodoVo,
  TodoPageFiltersVo,
  TodoListFiltersVo,
  CreateSubTodoVo,
  SubTodoListFilterVo,
} from '@life-toolkit/vo/todo';
import { OperationByIdListVo } from '@life-toolkit/vo';

export default class TodoService {
  static async getTodoWithSub(todoId: string) {
    try {
      return TodoController.getTodoWithSub(todoId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getSubTodoList(params: SubTodoListFilterVo) {
    try {
      const res = SubTodoController.getSubTodoList(params);
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async batchDoneTodo(params: OperationByIdListVo) {
    try {
      const res = TodoController.batchDoneTodo(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreTodo(id: string) {
    try {
      const res = TodoController.restoreTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonTodo(id: string) {
    try {
      const res = TodoController.abandonTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addTodo(todo: CreateTodoVo) {
    try {
      const res = TodoController.addTodo(todo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteTodo(id: string) {
    try {
      const res = await TodoController.deleteTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateTodo(id: string, todo: Partial<CreateTodoVo>) {
    try {
      const res = TodoController.updateTodo(id, todo);
      Message.success('操作成功');
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

  static async addSubTodo(subTodo: CreateSubTodoVo) {
    try {
      const res = SubTodoController.addSubTodo(subTodo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getSubTodoWithSub(todoId: string) {
    try {
      return SubTodoController.getSubTodoWithSub(todoId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreSubTodo(id: string) {
    try {
      const res = SubTodoController.restoreSubTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonSubTodo(id: string) {
    try {
      const res = SubTodoController.abandonSubTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }
}
