import { TodoRelatedType } from '@true-north/enum';

export type TodoRelatedNone = { relatedType: TodoRelatedType.NONE | undefined; relatedId?: string };
export type TodoRelatedTask = { relatedType: TodoRelatedType.TASK; relatedId: string };
export type TodoRelatedHabit = { relatedType: TodoRelatedType.HABIT; relatedId: string };
export type TodoRelatedRepeat = { relatedType: TodoRelatedType.REPEAT; relatedId: string };
export type TodoRelatedGoal = { relatedType: TodoRelatedType.GOAL; relatedId: string };
export type TodoRelatedIsRepeat = { relatedType: TodoRelatedType.IS_REPEAT; relatedId?: string };

export type NarrowedTodoRelated =
  | TodoRelatedNone
  | TodoRelatedTask
  | TodoRelatedHabit
  | TodoRelatedRepeat
  | TodoRelatedGoal
  | TodoRelatedIsRepeat;

export type TodoRelatedLike = {
  relatedType?: TodoRelatedType | null;
  relatedId?: string | null;
};

/**
 * 将扁平 relatedType/relatedId 收窄为判别联合，便于 service 内 switch。
 */
export function narrowTodoRelated(input: TodoRelatedLike): NarrowedTodoRelated {
  const relatedType = input.relatedType ?? TodoRelatedType.NONE;
  const relatedId = input.relatedId ?? undefined;

  switch (relatedType) {
    case TodoRelatedType.TASK:
      if (!relatedId) throw new Error('relatedType=task 时 relatedId 不能为空');
      return { relatedType, relatedId };
    case TodoRelatedType.HABIT:
      if (!relatedId) throw new Error('relatedType=habit 时 relatedId 不能为空');
      return { relatedType, relatedId };
    case TodoRelatedType.REPEAT:
      if (!relatedId) throw new Error('relatedType=repeat 时 relatedId 不能为空');
      return { relatedType, relatedId };
    case TodoRelatedType.GOAL:
      if (!relatedId) throw new Error('relatedType=goal 时 relatedId 不能为空');
      return { relatedType, relatedId };
    case TodoRelatedType.IS_REPEAT:
      return { relatedType, relatedId };
    case TodoRelatedType.NONE:
    default:
      return { relatedType: TodoRelatedType.NONE, relatedId };
  }
}

/** 从 relatedType 派生兼容字段（VO / 旧调用方）；缺 relatedId 时不抛错 */
export function deriveCompatIds(input: TodoRelatedLike): {
  taskId?: string;
  habitId?: string;
  repeatId?: string;
} {
  const relatedType = input.relatedType ?? TodoRelatedType.NONE;
  const relatedId = input.relatedId || undefined;
  if (!relatedId) return {};
  switch (relatedType) {
    case TodoRelatedType.TASK:
      return { taskId: relatedId };
    case TodoRelatedType.HABIT:
      return { habitId: relatedId };
    case TodoRelatedType.REPEAT:
    case TodoRelatedType.IS_REPEAT:
      return { repeatId: relatedId };
    default:
      return {};
  }
}

/** 将旧 VO 的 taskId/habitId/repeatId 映射为 relatedType + relatedId */
export function mapCompatIdsToRelated(input: {
  relatedType?: TodoRelatedType;
  relatedId?: string;
  taskId?: string;
  habitId?: string;
  repeatId?: string;
}): { relatedType: TodoRelatedType; relatedId?: string } {
  if (input.relatedType && input.relatedId) {
    return { relatedType: input.relatedType, relatedId: input.relatedId };
  }
  if (input.relatedType === TodoRelatedType.NONE) {
    return { relatedType: TodoRelatedType.NONE, relatedId: input.relatedId };
  }
  if (input.taskId) {
    return { relatedType: TodoRelatedType.TASK, relatedId: input.taskId };
  }
  if (input.habitId) {
    return { relatedType: TodoRelatedType.HABIT, relatedId: input.habitId };
  }
  if (input.repeatId) {
    return { relatedType: TodoRelatedType.REPEAT, relatedId: input.repeatId };
  }
  return {
    relatedType: input.relatedType ?? TodoRelatedType.NONE,
    relatedId: input.relatedId,
  };
}
