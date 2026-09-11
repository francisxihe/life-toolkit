import { TodoRelatedType } from '@true-north/enum';
import { store } from '../../storage';
import { GoalRepository } from '../goal/goal.repository';
import { HabitRepository } from '../habit/habit.repository';
import { TaskService, taskService as defaultTaskService } from '../task/task.service';
import { Todo } from '../todo/todo.entity';
import { AiPlatformError } from '@true-north/plugin-sdk';

const CONTEXT_CAP = 20;

export type GoalDecomposeContext = {
  goalId: string;
  goalName: string;
  childGoalTitles: string[];
  promptContext: string;
};

function formatDate(value?: Date | string | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function markTruncated(items: string[], total: number): string[] {
  if (total > items.length) {
    return [...items, `[truncated ${total - items.length} more]`];
  }
  return items;
}

export class GoalContextBuilder {
  constructor(
    private readonly goalRepository = new GoalRepository(),
    private readonly habitRepository = new HabitRepository(),
    private readonly taskService: TaskService = defaultTaskService
  ) {}

  async build(goalId: string): Promise<GoalDecomposeContext> {
    let goal;
    try {
      goal = await this.goalRepository.find(goalId);
    } catch {
      throw AiPlatformError.contextNotFound(`目标不存在或已删除: ${goalId}`);
    }

    const children = await this.goalRepository.findByFilter({ parentId: goalId } as any);
    const childTitles = children.map((item) => item.name).filter(Boolean);
    const childGoalTitles = childTitles.slice(0, CONTEXT_CAP);

    const tasks = await this.taskService.findByGoalIds([goalId]);
    const taskLines = tasks.slice(0, CONTEXT_CAP).map((task) => `- ${task.name} [${task.status}]`);

    const todoRepo = store().getRepository(Todo);
    const todos = await todoRepo
      .createQueryBuilder('todo')
      .andWhere('todo.deletedAt IS NULL')
      .andWhere('todo.relatedType = :relatedType', { relatedType: TodoRelatedType.GOAL })
      .andWhere('todo.relatedId = :relatedId', { relatedId: goalId })
      .orderBy('todo.updatedAt', 'DESC')
      .take(CONTEXT_CAP + 1)
      .getMany();
    const todoTotal = todos.length;
    const todoLines = todos
      .slice(0, CONTEXT_CAP)
      .map((todo) => `- ${todo.name} [${todo.status}] plan=${todo.planDate || ''}`);

    const habits = await this.habitRepository.findByFilter({ goalId } as any);
    const habitLines = habits.slice(0, CONTEXT_CAP).map((habit) => `- ${habit.name} [${habit.status}]`);

    const lines = [
      `Goal:`,
      `- id: ${goal.id}`,
      `- name: ${goal.name}`,
      `- description: ${goal.description || ''}`,
      `- type: ${goal.type}`,
      `- status: ${goal.status}`,
      `- importance: ${goal.importance}`,
      `- difficulty: ${goal.difficulty ?? ''}`,
      `- startAt: ${formatDate(goal.startAt)}`,
      `- endAt: ${formatDate(goal.endAt)}`,
      '',
      `Direct child goals (${childTitles.length}):`,
      ...markTruncated(
        childGoalTitles.map((title) => `- ${title}`),
        childTitles.length
      ),
      '',
      `Related tasks (${tasks.length}):`,
      ...markTruncated(taskLines, tasks.length),
      '',
      `Related todos (${Math.min(todoTotal, CONTEXT_CAP)}${todoTotal > CONTEXT_CAP ? '+' : ''}):`,
      ...todoLines,
      todoTotal > CONTEXT_CAP ? `[truncated]` : '',
      '',
      `Related habits (${habits.length}):`,
      ...markTruncated(habitLines, habits.length),
    ].filter(Boolean);

    return {
      goalId: goal.id,
      goalName: goal.name,
      childGoalTitles,
      promptContext: lines.join('\n'),
    };
  }
}

export const goalContextBuilder = new GoalContextBuilder();
