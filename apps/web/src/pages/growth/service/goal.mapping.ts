import type { GoalVo, UpdateGoalVo } from '@life-toolkit/vo/growth';
import type { GoalFormData } from './goal.types';

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
        goalVo.children?.map((child) => GoalMapping.voToGoalFormData(child)) ||
        [],
    };
  }

  static formDataToUpdateVo(formData: GoalFormData): Partial<UpdateGoalVo> {
    return {
      ...formData,
      startAt: formData.planTimeRange[0],
      endAt: formData.planTimeRange[1],
    };
  }
}
