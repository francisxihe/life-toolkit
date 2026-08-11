import type { AiSuggestion, Task, TaskDecomposePayload, Todo } from './types';
import { addDays } from './utils';
import { TODAY } from './mock-data';

export function buildTaskDecomposePayload(task: Task, tasks: Task[], todos: Todo[]): TaskDecomposePayload {
  const start = addDays(TODAY, 1);
  const children = tasks.filter((item) => item.parentId === task.id);
  const relatedTodos = todos.filter((todo) => todo.taskId === task.id);
  const suggestions: AiSuggestion[] = [
    {
      id: `${task.id}-subtask-1`,
      kind: 'task',
      title: `${task.title} · 拆分子步骤`,
      goalId: task.goalId || '',
      parentId: task.id,
      taskId: task.id,
      planned: start,
      importance: Math.min(5, task.importance),
      difficulty: Math.min(5, task.difficulty),
      impact: '把任务拆成可独立推进的子任务，降低一次做完的压力。',
      reason: children.length ? '已有子任务，可补充下一关键步骤。' : '当前缺少可执行的子任务拆分。',
      conflict: children.some((item) => item.title.includes('拆分子步骤')) ? '已存在相近子任务' : undefined,
    },
    {
      id: `${task.id}-subtask-2`,
      kind: 'task',
      title: `验收「${task.title}」的完成标准`,
      goalId: task.goalId || '',
      parentId: task.id,
      taskId: task.id,
      planned: addDays(TODAY, 3),
      importance: task.importance,
      difficulty: 2,
      impact: '明确完成定义，减少返工。',
      reason: '多数任务缺少可检查的验收步骤。',
    },
    {
      id: `${task.id}-todo-1`,
      kind: 'todo',
      title: `为「${task.title}」安排今日最小动作`,
      goalId: task.goalId || '',
      taskId: task.id,
      planned: TODAY,
      importance: task.importance,
      difficulty: 1,
      impact: '把抽象任务落到今天可完成的待办。',
      reason: relatedTodos.length ? '已有关联待办，可补充当日下一步。' : '尚无关联待办，适合先落一个最小动作。',
    },
    {
      id: `${task.id}-todo-2`,
      kind: 'todo',
      title: `梳理「${task.title}」的阻塞项`,
      goalId: task.goalId || '',
      taskId: task.id,
      planned: start,
      importance: Math.min(5, task.importance + 0),
      difficulty: 2,
      impact: '提前暴露依赖，避免临期卡住。',
      reason: '执行前识别依赖与外部协作。',
    },
  ];
  return {
    analysisSummary: `正在分析「${task.title}」的子任务层级、${children.length} 项子任务与 ${relatedTodos.length} 项关联待办。`,
    suggestions,
  };
}
