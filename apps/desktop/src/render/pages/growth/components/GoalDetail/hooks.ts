import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Difficulty, GoalType, Importance } from '@true-north/enum';
import { DIFFICULTY_MAP, IMPORTANCE_MAP } from '../../constants';
import { GoalFormData } from '@true-north/web-service';
import { GoalVo } from '@true-north/vo';

export const useGoalFormConstraints = (parentGoal: GoalVo) => {
  const allowedDateRange = useMemo(() => {
    if (!parentGoal) {
      return null;
    }

    return parentGoal.startAt && parentGoal.endAt
      ? [parentGoal.startAt, parentGoal.endAt]
      : null;
  }, [parentGoal]);

  const allowedTypes = useMemo(() => {
    if (!parentGoal) {
      return [GoalType.VISION];
    }

    return parentGoal.type === GoalType.RESULT
      ? [GoalType.RESULT]
      : [GoalType.VISION, GoalType.RESULT];
  }, [parentGoal]);

  const allowedImportance = useMemo(() => {
    if (!parentGoal) {
      return [...IMPORTANCE_MAP.keys()];
    }

    // 2. 重要程度约束：子目标重要程度不能低于父目标
    const parentImportanceLevel = Object.values(Importance).indexOf(
      parentGoal.importance,
    );

    return [...IMPORTANCE_MAP.keys()].filter((importance) => {
      const currentLevel = Object.values(Importance).indexOf(importance);
      return currentLevel <= parentImportanceLevel; // 数值越小，重要程度越高
    });
  }, [parentGoal]);

  const allowedDifficulty = useMemo(() => {
    if (!parentGoal?.difficulty) return [...DIFFICULTY_MAP.keys()];
    return [...DIFFICULTY_MAP.keys()].filter((difficulty) => difficulty <= parentGoal.difficulty!);
  }, [parentGoal]);

  function updateByConstraints(goalFormData: GoalFormData) {
    const updates: Partial<typeof goalFormData> = {};

    // 检查父目标是否为成果指标
    if (parentGoal.startAt && parentGoal.endAt) {
      if (
        (goalFormData.planTimeRange[0] && dayjs(goalFormData.planTimeRange[0]).isBefore(dayjs(parentGoal.startAt))) ||
        (goalFormData.planTimeRange[1] && dayjs(goalFormData.planTimeRange[1]).isAfter(dayjs(parentGoal.endAt)))
      ) {
        updates.planTimeRange = [undefined, undefined];
      }
    }

    // 检查目标类型是否符合约束
    if (
      parentGoal.type === GoalType.RESULT &&
      goalFormData.type !== GoalType.RESULT
    ) {
      updates.type = GoalType.RESULT;
    }

    // 检查重要程度是否符合约束（子目标重要程度不能低于父目标）
    const parentImportanceLevel = Object.values(Importance).indexOf(
      parentGoal.importance,
    );

    const currentImportanceLevel = Object.values(Importance).indexOf(
      goalFormData.importance,
    );

    if (currentImportanceLevel > parentImportanceLevel) {
      updates.importance = parentGoal.importance;
    }

    if (
      parentGoal.difficulty !== undefined &&
      goalFormData.difficulty !== undefined &&
      goalFormData.difficulty > parentGoal.difficulty
    ) {
      updates.difficulty = parentGoal.difficulty as Difficulty;
    }

    return updates;
  }

  return {
    allowedDateRange,
    allowedTypes,
    allowedImportance,
    allowedDifficulty,
    updateByConstraints,
  };
};
