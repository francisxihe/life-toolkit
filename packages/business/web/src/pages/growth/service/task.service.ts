import { Message } from '@arco-design/web-react';
import { TaskController } from '@life-toolkit/api';
import type {
  CreateTaskVo,
  TaskPageFilterVo,
  TaskFilterVo,
  TaskModelVo,
  UpdateTaskVo,
} from '@life-toolkit/vo/growth';
import { OperationByIdListVo } from '@life-toolkit/vo';
import { useState, useEffect } from 'react';
export default class TaskService {
  static async getTaskDetail(taskId: string) {
    try {
      return TaskController.find(taskId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async batchDoneTask(params: OperationByIdListVo) {
    try {
      // Task 模块暂时没有批量操作方法，需要逐个处理
      const results = await Promise.all(
        params.includeIds?.map(id => TaskController.abandon(id)) || []
      );
      Message.success('操作成功');
      return results;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreTask(id: string) {
    try {
      const res = await TaskController.restore(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonTask(id: string) {
    try {
      const res = await TaskController.abandon(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async createTask(task: CreateTaskVo) {
    try {
      const res = await TaskController.create(task);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteTask(id: string) {
    try {
      const res = await TaskController.delete(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateTask(id: string, task: UpdateTaskVo, silent = true) {
    try {
      const res = await TaskController.update(id, task);
      if (!silent) {
        Message.success('操作成功');
      }
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTaskList(params: TaskFilterVo = {}) {
    try {
      return TaskController.findByFilter(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static useTaskList = (params: TaskFilterVo = {}) => {
    const [taskList, setTaskList] = useState<TaskModelVo[]>([]);
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

  static async getTaskPage(params: TaskPageFilterVo = {}) {
    try {
      return TaskController.page(params);
    } catch (error) {
      Message.error(error.message);
    }
  }
}
