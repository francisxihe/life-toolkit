import type { TaskVo, UpdateTaskVo, CreateTaskVo } from '@true-north/vo';
import type { TaskFormData } from './task.types';
import dayjs from 'dayjs';

const formatDateTime = (value?: TaskFormData['planTimeRange'][number]) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD HH:mm') : undefined;

const toValidDayjs = (value?: TaskVo['startAt']) => {
  const date = value ? dayjs(value) : undefined;
  return date?.isValid() ? date : undefined;
};

export default class TaskMapping {
  static voToFormData(taskVo: TaskVo): TaskFormData {
    return {
      name: taskVo.name,
      description: taskVo.description,
      tags: taskVo.tags,
      importance: taskVo.importance,
      difficulty: taskVo.difficulty,
      urgency: taskVo.urgency,
      estimateTime: taskVo.estimateTime,
      planTimeRange: [
        toValidDayjs(taskVo.startAt),
        toValidDayjs(taskVo.endAt),
      ],
      // 以下为关联数据
      goalId: taskVo.goal?.id ?? taskVo.goalId,
      parentId: taskVo.parent?.id ?? taskVo.parentId,
      isSubTask: Boolean(taskVo.parent?.id ?? taskVo.parentId),
      children: taskVo.children || [],
      todoList: taskVo.todoList || [],
      trackTimeList: taskVo.trackTimeList,
    };
  }

  static formDataToCreateVo(formData: TaskFormData): CreateTaskVo {
    return {
      name: formData.name,
      description: formData.description,
      tags: formData.tags || [],
      importance: formData.importance,
      difficulty: formData.difficulty,
      urgency: formData.urgency,
      parentId: formData.isSubTask ? formData.parentId : undefined,
      goalId: formData.isSubTask ? undefined : formData.goalId,
      startAt: formatDateTime(formData.planTimeRange[0]),
      endAt: formatDateTime(formData.planTimeRange[1]),
      estimateTime: formData.estimateTime ?? undefined,
    };
  }

  static formDataToUpdateVo(formData: TaskFormData): UpdateTaskVo {
    return {
      name: formData.name,
      description: formData.description,
      tags: formData.tags || [],
      importance: formData.importance,
      difficulty: formData.difficulty,
      urgency: formData.urgency,
      // null is intentional: it survives IPC and clears the opposite relation.
      parentId: (formData.isSubTask ? formData.parentId : null) as any,
      goalId: (formData.isSubTask ? null : formData.goalId) as any,
      startAt: formatDateTime(formData.planTimeRange[0]),
      endAt: formatDateTime(formData.planTimeRange[1]),
      estimateTime: formData.estimateTime ?? undefined,
    };
  }
}
