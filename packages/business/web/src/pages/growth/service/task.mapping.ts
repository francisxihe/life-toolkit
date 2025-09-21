import type { TaskVo, UpdateTaskVo, CreateTaskVo } from '@life-toolkit/vo';
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

  static formDataToCreateVo(formData: TaskFormData): CreateTaskVo {
    const { isSubTask, ...rest } = formData;
    return {
      ...rest,
      parentId: isSubTask ? formData.parentId : undefined,
      goalId: isSubTask ? undefined : formData.goalId,
      startAt: formData.planTimeRange[0],
      endAt: formData.planTimeRange[1],
      children: formData.children || [],
    };
  }
  static formDataToUpdateVo(formData: TaskFormData): UpdateTaskVo {
    const { isSubTask, ...rest } = formData;
    return {
      ...rest,
      parentId: isSubTask ? formData.parentId : undefined,
      goalId: isSubTask ? undefined : formData.goalId,
      startAt: formData.planTimeRange[0],
      endAt: formData.planTimeRange[1],
      children: formData.children || [],
    };
  }
}
