import type { GoalVo, UpdateGoalVo, CreateGoalVo } from '@true-north/vo';
import type { GoalFormData } from './goal.types';
import dayjs from 'dayjs';

const formatDate = (value?: GoalFormData['planTimeRange'][number]) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : undefined;

export default class GoalMapping {
  static voToGoalFormData(goalVo: GoalVo): GoalFormData {
    return {
      name: goalVo.name,
      description: goalVo.description,
      importance: goalVo.importance,
      difficulty: goalVo.difficulty,
      planTimeRange: [
        goalVo.startAt ? dayjs(goalVo.startAt) : undefined,
        goalVo.endAt ? dayjs(goalVo.endAt) : undefined,
      ],
      type: goalVo.type,
      status: goalVo.status,
      parentId: goalVo.parent?.id ?? goalVo.parentId,
      children: goalVo.children?.map((child) => GoalMapping.voToGoalFormData(child)) || [],
    };
  }

  static formDataToCreateVo(formData: GoalFormData): CreateGoalVo {
    return {
      name: formData.name,
      type: formData.type,
      status: formData.status,
      description: formData.description,
      importance: formData.importance,
      difficulty: formData.difficulty,
      parentId: (formData.parentId || null) as any,
      startAt: formatDate(formData.planTimeRange[0]),
      endAt: formatDate(formData.planTimeRange[1]),
    };
  }

  static formDataToUpdateVo(formData: GoalFormData): Partial<UpdateGoalVo> {
    return {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      importance: formData.importance,
      difficulty: formData.difficulty,
      parentId: (formData.parentId || null) as any,
      startAt: formatDate(formData.planTimeRange[0]),
      endAt: formatDate(formData.planTimeRange[1]),
    };
  }
}
