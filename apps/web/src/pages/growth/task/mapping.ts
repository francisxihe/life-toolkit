import type { TaskVo } from '@life-toolkit/vo/task';
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
      children:
        taskVo.children?.map((child) => {
          return {
            ...child,
            planTimeRange: [child.startAt, child.endAt],
          };
        }) || [],
    };
  }
}
