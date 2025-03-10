import { Message } from '@arco-design/web-react';
import TaskController from '@life-toolkit/api/controller/task/task';
import type {
  CreateTaskVo,
  TaskPageFiltersVo,
  TaskListFiltersVo,
  TaskItemVo,
  UpdateTaskVo,
} from '@life-toolkit/vo/growth';
import { OperationByIdListVo } from '@life-toolkit/vo';
import { useState, useEffect } from 'react';
export default class TaskService {
  static async getTaskWithTrackTime(taskId: string) {
    try {
      return TaskController.getTaskWithTrackTime(taskId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async batchDoneTask(params: OperationByIdListVo) {
    try {
      const res = await TaskController.batchDoneTask(params);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreTask(id: string) {
    try {
      const res = await TaskController.restoreTask(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonTask(id: string) {
    try {
      const res = await TaskController.abandonTask(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addTask(task: CreateTaskVo) {
    try {
      const res = await TaskController.addTask(task);
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

  static async updateTask(id: string, task: UpdateTaskVo, silent = true) {
    try {
      const res = await TaskController.updateTask(id, task);
      if (!silent) {
        Message.success('操作成功');
      }
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

  static useTaskList = (params: TaskListFiltersVo = {}) => {
    const [taskList, setTaskList] = useState<TaskItemVo[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTaskList = async () => {
      setLoading(true);
      const res = await TaskService.getTaskList(params);
      setTaskList(res.list);
      setLoading(false);
    };

    useEffect(() => {
      fetchTaskList();
    }, []);

    return { taskList, loading };
  };

  static async getTaskPage(params: TaskPageFiltersVo = {}) {
    try {
      return TaskController.getTaskPage(params);
    } catch (error) {
      Message.error(error.message);
    }
  }
}
