import TaskController from '../controller/task';
import type { Task as TaskVO } from '@true-north/vo';
import { Message } from '../message';
import { MethodOptions } from '../type';

export default class TaskService {
  static async create(createTaskVo: TaskVO.CreateTaskVo, options?: MethodOptions) {
    try {
      const res = await TaskController.create(createTaskVo);
      if (!options?.silent) {
        Message.success('创建成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async delete(id: string, options?: MethodOptions) {
    try {
      const res = await TaskController.delete(id);
      if (!options?.silent) {
        Message.success('删除成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async update(id: string, body: TaskVO.UpdateTaskVo, options?: MethodOptions) {
    try {
      const res = await TaskController.update(id, body);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async find(id: string) {
    try {
      const res = await TaskController.find(id);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async findByFilter(taskListFiltersVo?: TaskVO.TaskFilterVo) {
    try {
      const res = await TaskController.findByFilter(taskListFiltersVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async getTree(taskFilterVo?: TaskVO.TaskFilterVo) {
    try {
      const res = await TaskController.getTree(taskFilterVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async page(taskPageFilterVo?: TaskVO.TaskPageFilterVo) {
    try {
      const res = await TaskController.page(taskPageFilterVo);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async taskWithRelations(id: string) {
    try {
      const res = await TaskController.taskWithRelations(id);
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async abandon(id: string, options?: MethodOptions) {
    try {
      const res = await TaskController.abandon(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async restore(id: string, options?: MethodOptions) {
    try {
      const res = await TaskController.restore(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async markDone(id: string, options?: MethodOptions) {
    try {
      const res = await TaskController.markDone(id);
      if (!options?.silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error: unknown) {
      Message.error(error);
    }
  }

  static async start(id: string, options?: MethodOptions) {
    try {
      const res = await TaskController.start(id);
      if (!options?.silent) Message.success('任务已开始');
      return res;
    } catch (error: unknown) {
      Message.error(error);
      throw error;
    }
  }

  static async pause(id: string, options?: MethodOptions) {
    try {
      const res = await TaskController.pause(id);
      if (!options?.silent) Message.success('任务已暂停');
      return res;
    } catch (error: unknown) {
      Message.error(error);
      throw error;
    }
  }
}
