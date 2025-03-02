import type { GoalVo } from '@life-toolkit/vo/growth';
import type { GoalFormData } from './types';

export class GoalMapping {
  static voToGoalFormData(goalVo: GoalVo): GoalFormData {
    return {
      name: goalVo.name,
      description: goalVo.description,
      importance: goalVo.importance,
      urgency: goalVo.urgency,
      planTimeRange: [goalVo.startAt, goalVo.endAt],
      type: goalVo.type,
      status: goalVo.status,
      children:
        goalVo.children?.map((child) =>
          GoalMapping.voToGoalFormData(child),
        ) || [],
    };
  }
}
