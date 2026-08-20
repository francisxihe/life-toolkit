import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Difficulty } from '@true-north/enum';
import { DIFFICULTY_MAP, IMPORTANCE_MAP } from '../../constants';
import { TaskFormData } from '@true-north/web-service';
import { TaskVo, GoalVo } from '@true-north/vo';

export const useTaskFormConstraints = (
  parentTask: TaskVo | null,
  parentGoal: GoalVo | null,
) => {
  const allowedDateRange = useMemo(() => {
    // 优先使用父任务的时间范围，其次是父目标
    const parent = parentTask || parentGoal;
    if (!parent) {
      return null;
    }

    return parent.startAt && parent.endAt
      ? [parent.startAt, parent.endAt]
      : null;
  }, [parentTask, parentGoal]);

  const allowedImportance = useMemo(() => {
    // 优先使用父任务的重要程度，其次是父目标
    const parent = parentTask || parentGoal;
    if (!parent) {
      return [...IMPORTANCE_MAP.keys()];
    }

    // 重要程度约束：子任务重要程度不能高于父任务/目标
    if (parent.importance === undefined) return [...IMPORTANCE_MAP.keys()];
    return [...IMPORTANCE_MAP.keys()].filter((importance) => importance <= parent.importance!);
  }, [parentTask, parentGoal]);

  const allowedDifficulty = useMemo(() => {
    const parent = parentTask || parentGoal;
    if (!parent?.difficulty) return [...DIFFICULTY_MAP.keys()];
    return [...DIFFICULTY_MAP.keys()].filter((difficulty) => difficulty <= parent.difficulty!);
  }, [parentTask, parentGoal]);

  function updateByConstraints(taskFormData: TaskFormData) {
    const parent = parentTask || parentGoal;
    if (!parent) return {};

    const updates: Partial<typeof taskFormData> = {};

    // 检查时间范围约束
    if (parent.startAt && parent.endAt && taskFormData.planTimeRange) {
      const [taskStart, taskEnd] = taskFormData.planTimeRange;
      if (
        (taskStart && dayjs(taskStart).isBefore(dayjs(parent.startAt))) ||
        (taskEnd && dayjs(taskEnd).isAfter(dayjs(parent.endAt)))
      ) {
        updates.planTimeRange = [undefined, undefined];
      }
    }

    // 检查重要程度是否符合约束
    if (
      parent.importance !== undefined &&
      taskFormData.importance !== undefined &&
      taskFormData.importance > parent.importance
    ) {
      updates.importance = parent.importance;
    }

    if (parent.difficulty && taskFormData.difficulty && taskFormData.difficulty > parent.difficulty) {
      updates.difficulty = parent.difficulty as Difficulty;
    }

    return updates;
  }

  return {
    allowedDateRange,
    allowedImportance,
    allowedDifficulty,
    updateByConstraints,
  };
};
