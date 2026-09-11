import { TodoRelatedType } from '@true-north/enum';
import { store } from '../../storage';
import { TaskRepository } from '../task/task.repository';
import { taskService as defaultTaskService, TaskService } from '../task/task.service';
import { Todo } from '../todo/todo.entity';
import { AiPlatformError } from '@true-north/plugin-sdk';

const CONTEXT_CAP = 20;

export type TaskDecomposeContext = {
  taskId: string;
  taskName: string;
  childTaskTitles: string[];
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

export class TaskContextBuilder {
  constructor(
    private readonly taskRepository = new TaskRepository(),
    private readonly taskService: TaskService = defaultTaskService
  ) {}

  async build(taskId: string): Promise<TaskDecomposeContext> {
    let task;
    try {
      task = await this.taskRepository.find(taskId);
    } catch {
      throw AiPlatformError.contextNotFound(`任务不存在或已删除: ${taskId}`);
    }

    const children = await this.taskRepository.repo
      .createQueryBuilder('task')
      .andWhere('task.deletedAt IS NULL')
      .andWhere('task.parentId = :parentId', { parentId: taskId })
      .orderBy('task.updatedAt', 'DESC')
      .getMany();
    const childTitles = children.map((item) => item.name).filter(Boolean);
    const childTaskTitles = childTitles.slice(0, CONTEXT_CAP);

    const todoRepo = store().getRepository(Todo);
    const todos = await todoRepo
      .createQueryBuilder('todo')
      .andWhere('todo.deletedAt IS NULL')
      .andWhere('todo.relatedType = :relatedType', { relatedType: TodoRelatedType.TASK })
      .andWhere('todo.relatedId = :relatedId', { relatedId: taskId })
      .orderBy('todo.updatedAt', 'DESC')
      .take(CONTEXT_CAP + 1)
      .getMany();
    const todoTotal = todos.length;
    const todoLines = todos
      .slice(0, CONTEXT_CAP)
      .map((todo) => `- ${todo.name} [${todo.status}] plan=${todo.planDate || ''}`);

    let siblingLines: string[] = [];
    let siblingTotal = 0;
    if (task.goalId) {
      const siblings = (await this.taskService.findByGoalIds([task.goalId])).filter(
        (item) => item.id !== taskId && !item.parentId
      );
      siblingTotal = siblings.length;
      siblingLines = siblings
        .slice(0, CONTEXT_CAP)
        .map((item) => `- ${item.name} [${item.status}]`);
    }

    const lines = [
      `Task:`,
      `- id: ${task.id}`,
      `- name: ${task.name}`,
      `- description: ${task.description || ''}`,
      `- status: ${task.status}`,
      `- importance: ${task.importance ?? ''}`,
      `- difficulty: ${task.difficulty ?? ''}`,
      `- urgency: ${task.urgency ?? ''}`,
      `- goalId: ${task.goalId || ''}`,
      `- parentId: ${task.parentId || ''}`,
      `- startAt: ${formatDate(task.startAt)}`,
      `- endAt: ${formatDate(task.endAt)}`,
      '',
      `Direct child tasks (${childTitles.length}):`,
      ...markTruncated(
        childTaskTitles.map((title) => `- ${title}`),
        childTitles.length
      ),
      '',
      `Related todos (${Math.min(todoTotal, CONTEXT_CAP)}${todoTotal > CONTEXT_CAP ? '+' : ''}):`,
      ...todoLines,
      todoTotal > CONTEXT_CAP ? `[truncated]` : '',
      '',
      `Sibling tasks under same goal (${siblingTotal}):`,
      ...markTruncated(siblingLines, siblingTotal),
    ].filter(Boolean);

    return {
      taskId: task.id,
      taskName: task.name,
      childTaskTitles,
      promptContext: lines.join('\n'),
    };
  }
}

export const taskContextBuilder = new TaskContextBuilder();
