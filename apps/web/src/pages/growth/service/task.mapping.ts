import type { TaskVo, UpdateTaskVo } from '@life-toolkit/vo/growth';
import type { TaskFormData } from './task.types';

export class TaskMapping {
  static voToFormData(taskVo: TaskVo): TaskFormData {
    return {
      name: taskVo.name,
      description: taskVo.description,
      tags: taskVo.tags,
      importance: taskVo.importance,
      urgency: taskVo.urgency,
      estimateTime: taskVo.estimateTime,
      planTimeRange: [taskVo.startAt, taskVo.endAt],
      // 以下为关联数据
      goalId: taskVo.goal?.id,
      parentId: taskVo.parent?.id,
      isSubTask: !!taskVo.parent,
      children: taskVo.children || [],
      todoList: taskVo.todoList || [],
      trackTimeList: taskVo.trackTimeList,
    };
  }

  static formDataToUpdateVo(formData: TaskFormData): UpdateTaskVo {
    return {
      ...formData,
      startAt: formData.planTimeRange[0],
      endAt: formData.planTimeRange[1],
      children: formData.children || [],
      // trackTimeList: formData.trackTimeList || [],
    };
  }
}
