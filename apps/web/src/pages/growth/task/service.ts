import { Message } from '@arco-design/web-react';
import TaskController from '@life-toolkit/api/controller/task/task';
import type {
  CreateTaskVo,
  TaskPageFiltersVo,
  TaskListFiltersVo,
  UpdateTaskVo,
} from '@life-toolkit/vo/growth';
import { OperationByIdListVo } from '@life-toolkit/vo';

export default class TaskService {
  static async getTaskWithTrackTime(todoId: string) {
    try {
      return TaskController.getTaskWithTrackTime(todoId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async batchDoneTask(params: OperationByIdListVo) {
    try {
      const res = TaskController.batchDoneTask(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreTask(id: string) {
    try {
      const res = TaskController.restoreTask(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonTask(id: string) {
    try {
      const res = TaskController.abandonTask(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addTask(task: CreateTaskVo) {
    try {
      const res = TaskController.addTask(task);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteTask(id: string) {
    try {
      const res = await TaskController.deleteTask(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateTask(id: string, task: UpdateTaskVo) {
    try {
      const res = TaskController.updateTask(id, task);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTaskList(params: TaskListFiltersVo = {}) {
    try {
      return TaskController.getTaskList(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTaskPage(params: TaskPageFiltersVo = {}) {
    try {
      return TaskController.getTaskPage(params);
    } catch (error) {
      Message.error(error.message);
    }
  }  
}
