import TodoController from '../controller/todo';
import type { Todo as TodoVO } from '@true-north/vo';
import { TodoRelatedType } from '@true-north/enum';
import { Message } from '../message';
import { MethodOptions } from '../type';

export default class TodoService {
  static async create(body: TodoVO.CreateTodoVo, options?: MethodOptions) {
    try {
      const res = await TodoController.create(body);
      if (!options?.silent) {
        Message.success('创建成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async delete(relatedType: TodoRelatedType, id: string, options?: MethodOptions) {
    try {
      const res = await TodoController.delete(relatedType, id);
      if (!options?.silent) {
        Message.success('删除成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async update(relatedType: TodoRelatedType, id: string, body: TodoVO.UpdateTodoVo, options?: MethodOptions) {
    try {
      const res = await TodoController.update(relatedType, id, body);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async page(query?: TodoVO.TodoPageFilterVo) {
    try {
      const res = await TodoController.page(query);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async find(relatedType: TodoRelatedType, id: string) {
    try {
      const res = await TodoController.find(relatedType, id);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async done(relatedType: TodoRelatedType, id: string, body?: { doneAt?: string }, options?: MethodOptions) {
    try {
      const res = await TodoController.done(relatedType, id, body);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async abandon(relatedType: TodoRelatedType, id: string, options?: MethodOptions) {
    try {
      const res = await TodoController.abandon(relatedType, id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async restore(relatedType: TodoRelatedType, id: string, options?: MethodOptions) {
    try {
      const res = await TodoController.restore(relatedType, id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async list(query?: TodoVO.TodoFilterVo) {
    try {
      const res = await TodoController.list(query);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async doneBatch(body: TodoVO.TodoFilterVo, options?: MethodOptions) {
    try {
      const res = await TodoController.doneBatch(body);
      if (!options?.silent) {
        Message.success('批量完成成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
      throw error;
    }
  }
}
