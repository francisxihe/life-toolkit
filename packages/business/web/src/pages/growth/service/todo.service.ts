import { Message } from '@arco-design/web-react';
import { TodoController } from '@life-toolkit/api';
import type {
  CreateTodoVo,
  TodoPageFiltersVo,
  TodoListFiltersVo,
  UpdateTodoVo,
} from '@life-toolkit/vo/growth';
import { OperationByIdListVo } from '@life-toolkit/vo';

export default class TodoService {
  /**
   * 获取单个任务
   * @param todoId 任务ID
   * @returns 任务详情
   */
  static async getTodoDetailWithRepeat(todoId: string) {
    try {
      return TodoController.getTodoDetailWithRepeat(todoId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  /**
   * 批量完成任务
   * @param params 任务ID列表
   * @returns 操作结果
   */
  static async batchDoneTodo(params: OperationByIdListVo) {
    try {
      const res = await TodoController.batchDoneTodo(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  /**
   * 恢复任务
   * @param id 任务ID
   * @returns 操作结果
   */
  static async restoreTodo(id: string) {
    try {
      const res = await TodoController.restoreTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  /**
   * 放弃任务
   * @param id 任务ID
   * @returns 操作结果
   */
  static async abandonTodo(id: string) {
    try {
      const res = await TodoController.abandonTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  /**
   * 添加任务
   * @param todo 任务详情
   * @returns 操作结果
   */
  static async createTodo(todo: CreateTodoVo) {
    try {
      const res = await TodoController.createTodo(todo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  /**
   * 删除任务
   * @param id 任务ID
   * @returns 操作结果
   */
  static async deleteTodo(id: string) {
    try {
      const res = await await TodoController.deleteTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  /**
   * 更新任务
   * @param id 任务ID
   * @param todo 任务详情
   * @param silent 是否静默
   * @returns 操作结果
   */
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

  /**
   * 获取任务列表
   * @param params 任务列表过滤条件
   * @returns 任务列表
   */
  static async getTodoListWithRepeat(params: TodoListFiltersVo = {}) {
    try {
      return TodoController.getTodoListWithRepeat(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  /**
   * 获取任务分页列表
   * @param params 任务分页过滤条件
   * @returns 任务分页列表
   */
  static async getTodoPage(params: TodoPageFiltersVo) {
    try {
      return TodoController.getTodoPage(params);
    } catch (error) {
      Message.error(error.message);
    }
  }
}
