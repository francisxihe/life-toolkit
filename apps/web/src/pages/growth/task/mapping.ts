import type { TaskVo } from '@life-toolkit/vo/growth';
import type { TaskFormData } from './types';

export class TaskMapping {
  static taskVoToTaskFormData(taskVo: TaskVo): TaskFormData {
    return {
      name: taskVo.name,
      description: taskVo.description,
      tags: taskVo.tags,
      importance: taskVo.importance,
      urgency: taskVo.urgency,
      planTimeRange: [taskVo.startAt, taskVo.endAt],
      estimateTime: taskVo.estimateTime,
      trackTimeList: taskVo.trackTimeList,
      goalId: taskVo.goal?.id,
      parentId: taskVo.parent?.id,
      children: taskVo.children || [],
      todoList: taskVo.todoList || [],
    };
  }
}
