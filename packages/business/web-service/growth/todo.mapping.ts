import type { TodoVo, UpdateTodoVo } from '@true-north/vo';
import type { TodoFormData } from './todo.types';

function toHm(value?: string): string | undefined {
  if (!value) return undefined;
  const [hour, minute] = value.split(':');
  if (hour === undefined || minute === undefined) return undefined;
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

export default class TodoMapping {
  static voToFormData(todoVo: TodoVo): TodoFormData {
    const start = toHm(todoVo.planStartTime);
    const end = toHm(todoVo.planEndTime);
    return {
      name: todoVo.name,
      description: todoVo.description,
      importance: todoVo.importance,
      urgency: todoVo.urgency,
      planDate: todoVo.planDate,
      planTimeRange: start && end ? [start, end] : undefined,
      repeatConfig: todoVo.repeatConfig,
      relatedType: todoVo.relatedType,
      settledTimes: todoVo.settledTimes,
    };
  }

  static formDataToUpdateVo(formData: TodoFormData): UpdateTodoVo {
    const planDate = formData.planDate;
    const repeatConfig = formData.repeatConfig
      ? {
          ...formData.repeatConfig,
          currentDate: planDate || formData.repeatConfig.currentDate,
          repeatStartDate: formData.repeatConfig.repeatStartDate || planDate,
        }
      : undefined;
    return {
      name: formData.name,
      description: formData.description,
      importance: formData.importance,
      urgency: formData.urgency,
      planDate,
      planStartTime: formData.planTimeRange?.[0],
      planEndTime: formData.planTimeRange?.[1],
      repeatConfig,
      status: formData.status,
    };
  }
}
