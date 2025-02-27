import type { GoalVo } from '@life-toolkit/vo/goal';
import type { GoalFormData } from './types';

export class GoalMapping {
  static goalVoToGoalFormData(goalVo: GoalVo): GoalFormData {
    return {
      name: goalVo.name,
      description: goalVo.description,
      importance: goalVo.importance,
      urgency: goalVo.urgency,
      planTimeRange: [goalVo.startAt, goalVo.endAt],
      children:
        goalVo.children?.map((child) => {
          return {
            ...child,
            planTimeRange: [child.startAt, child.endAt],
          } as GoalFormData;
        }) || [],
    };
  }
}
