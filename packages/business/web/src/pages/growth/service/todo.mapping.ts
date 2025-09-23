import type { TodoVo, UpdateTodoVo } from '@life-toolkit/vo';
import type { TodoFormData } from './todo.types';

export default class TodoMapping {
  static voToFormData(todoVo: TodoVo): TodoFormData {
    return {
      name: todoVo.name,
      description: todoVo.description,
      tags: todoVo.tags,
      importance: todoVo.importance,
      urgency: todoVo.urgency,
      planDate: todoVo.planDate,
      planTimeRange: [todoVo.planStartTime, todoVo.planEndTime],
      repeatConfig: todoVo.repeatConfig,
      source: todoVo.source,
    };
  }

  static formDataToUpdateVo(formData: TodoFormData): UpdateTodoVo {
    return {
      ...formData,
      planStartTime: formData.planTimeRange?.[0],
      planEndTime: formData.planTimeRange?.[1],
    };
  }
}
