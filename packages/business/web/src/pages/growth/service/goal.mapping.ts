import type {
  GoalVo,
  UpdateGoalVo,
  CreateGoalVo,
} from '@life-toolkit/vo/growth';
import type { GoalFormData } from './goal.types';

export class GoalMapping {
  static voToGoalFormData(goalVo: GoalVo): GoalFormData {
    return {
      name: goalVo.name,
      description: goalVo.description,
      importance: goalVo.importance,
      difficulty: goalVo.difficulty,
      planTimeRange: [goalVo.startAt, goalVo.endAt],
      type: goalVo.type,
      status: goalVo.status,
      parentId: goalVo.parent?.id,
      children:
        goalVo.children?.map((child) => GoalMapping.voToGoalFormData(child)) ||
        [],
    };
  }

  static formDataToCreateVo(formData: GoalFormData): CreateGoalVo {
    return {
      ...formData,
      startAt: formData.planTimeRange[0],
      endAt: formData.planTimeRange[1],
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
