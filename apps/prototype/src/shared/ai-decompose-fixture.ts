import type { AiSuggestion, Goal, GoalDecomposePayload, Habit, Task, Todo } from './types';
import { addDays } from './utils';
import { TODAY } from './mock-data';

export function buildGoalDecomposePayload(
  goal: Goal,
  goals: Goal[],
  tasks: Task[],
  todos: Todo[],
  habits: Habit[],
): GoalDecomposePayload {
  const start = addDays(TODAY, 1);
  const relatedTasks = tasks.filter((task) => task.goalId === goal.id);
  const relatedTodos = todos.filter((todo) => todo.goalId === goal.id);
  const hasResearch = relatedTasks.some((task) => task.title.includes('访谈'));
  const suggestions: AiSuggestion[] = [
    {
      id: `${goal.id}-subgoal`,
      kind: 'goal',
      title: `${goal.title} · 用户验证`,
      goalId: goal.id,
      parentId: goal.id,
      planned: start,
      importance: Math.min(5, goal.importance),
      difficulty: Math.min(5, goal.difficulty),
      impact: '形成可度量的阶段性交付，降低目标过于抽象的风险。',
      reason: '当前目标缺少可验证的阶段性拆分。',
      conflict: goals.some((item) => item.parentId === goal.id && item.title.includes('用户验证'))
        ? '已存在相近子目标'
        : undefined,
    },
    {
      id: `${goal.id}-task`,
      kind: 'task',
      title: `为“${goal.title}”安排关键行动`,
      goalId: goal.id,
      planned: start,
      importance: goal.importance,
      difficulty: Math.min(5, goal.difficulty),
      impact: '明确本周责任事项，预计提升目标推进节奏。',
      reason: hasResearch ? '已有访谈任务，建议补充下一关键行动。' : '尚未发现直接关联的验证任务。',
    },
    {
      id: `${goal.id}-todo`,
      kind: 'todo',
      title: `确认“${goal.title}”的下一步`,
      goalId: goal.id,
      planned: start,
      importance: goal.importance,
      difficulty: 2,
      impact: '将高优先级行动落实为明日可执行待办。',
      reason: '目标存在进行中工作，适合设定一个最小下一步。',
    },
    {
      id: `${goal.id}-habit`,
      kind: 'habit',
      title: `每日复盘“${goal.title}”进展`,
      goalId: goal.id,
      planned: start,
      importance: goal.importance,
      difficulty: 2,
      impact: '建立稳定反馈回路，减少目标与日常行动脱节。',
      reason: habits.some((habit) => habit.goalIds.includes(goal.id))
        ? '已有习惯关联，可补充复盘维度。'
        : '当前没有关联习惯。',
    },
  ];
  return {
    analysisSummary: `正在分析“${goal.title}”的目标层级、${relatedTasks.length} 项任务、${relatedTodos.length} 项待办与习惯反馈。`,
    suggestions,
  };
}
