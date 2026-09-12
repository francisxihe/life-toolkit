import { z } from 'zod';
import { GoalDecomposeKey, TaskDecomposeKey } from '@true-north/enum';
import type { AiSuggestionDraftVo, AiWorkspaceSuggestionVo } from '@true-north/vo';
import { type AgentTool } from '@true-north/plugin-sdk';
import { growthAi } from '../../context';
import { GoalRepository } from '../goal/goal.repository';
import { GoalFilterDto } from '../goal/dto';
import { TaskRepository } from '../task/task.repository';
import { TaskFilterDto } from '../task/dto';
import { goalContextBuilder } from './goal-context.builder';
import { taskContextBuilder } from './task-context.builder';

const SEARCH_CAP = 8;

const keywordSchema = z.object({
  keyword: z.string().min(1),
});

const goalIdSchema = z.object({
  goalId: z.string().min(1),
});

const taskIdSchema = z.object({
  taskId: z.string().min(1),
});

const goalDraftSchema = z.object({
  kind: z.enum(['goal', 'task', 'todo', 'habit']),
  title: z.string().min(1),
  reason: z.string().optional(),
  impact: z.string().optional(),
  planned: z.string().optional(),
  importance: z.coerce.number().optional(),
  difficulty: z.coerce.number().optional(),
});

const taskDraftSchema = z.object({
  kind: z.enum(['task', 'todo']),
  title: z.string().min(1),
  reason: z.string().optional(),
  impact: z.string().optional(),
  planned: z.string().optional(),
  importance: z.coerce.number().optional(),
  difficulty: z.coerce.number().optional(),
});

const decomposeGoalSchema = z.object({
  goalId: z.string().min(1),
  analysisSummary: z.string().optional(),
  suggestions: z.array(goalDraftSchema).min(1),
});

const decomposeTaskSchema = z.object({
  taskId: z.string().min(1),
  analysisSummary: z.string().optional(),
  suggestions: z.array(taskDraftSchema).min(1),
});

const suggestionItemProperties = {
  title: { type: 'string', description: '建议标题，简洁可执行' },
  reason: { type: 'string', description: '推荐理由' },
  impact: { type: 'string', description: '预期影响' },
  planned: { type: 'string', description: '计划日期 YYYY-MM-DD' },
  importance: { type: 'number', description: '重要度 1-5' },
  difficulty: { type: 'number', description: '难度 1-5' },
};

function jsonResult(value: unknown): string {
  return JSON.stringify(value);
}

const searchGoals: AgentTool = {
  name: 'search_goals',
  description: '按关键词搜索目标，返回 id、名称与状态。不确定实体 id 时先搜索。',
  readOnly: true,
  parameters: {
    type: 'object',
    properties: {
      keyword: { type: 'string', description: '目标名称或描述关键词' },
    },
    required: ['keyword'],
    additionalProperties: false,
  },
  schema: keywordSchema,
  async execute(args) {
    const { keyword } = keywordSchema.parse(args);
    const filter = new GoalFilterDto();
    filter.keyword = keyword;
    const list = await new GoalRepository().findByFilter(filter);
    return jsonResult({
      items: list.slice(0, SEARCH_CAP).map((goal) => ({
        id: goal.id,
        name: goal.name,
        status: goal.status,
        type: goal.type,
      })),
    });
  },
};

const searchTasks: AgentTool = {
  name: 'search_tasks',
  description: '按关键词搜索任务，返回 id、名称与状态。不确定实体 id 时先搜索。',
  readOnly: true,
  parameters: {
    type: 'object',
    properties: {
      keyword: { type: 'string', description: '任务名称或描述关键词' },
    },
    required: ['keyword'],
    additionalProperties: false,
  },
  schema: keywordSchema,
  async execute(args) {
    const { keyword } = keywordSchema.parse(args);
    const filter = new TaskFilterDto();
    filter.keyword = keyword;
    const list = await new TaskRepository().findByFilter(filter);
    return jsonResult({
      items: list.slice(0, SEARCH_CAP).map((task) => ({
        id: task.id,
        name: task.name,
        status: task.status,
        goalId: task.goalId || null,
      })),
    });
  },
};

const getGoal: AgentTool = {
  name: 'get_goal',
  description: '读取目标详情及子目标、相关任务/待办/习惯摘要。拆解前应先读取。',
  readOnly: true,
  parameters: {
    type: 'object',
    properties: {
      goalId: { type: 'string', description: '目标 id' },
    },
    required: ['goalId'],
    additionalProperties: false,
  },
  schema: goalIdSchema,
  async execute(args) {
    const { goalId } = goalIdSchema.parse(args);
    const context = await goalContextBuilder.build(goalId);
    return jsonResult({
      goalId: context.goalId,
      goalName: context.goalName,
      context: context.promptContext,
    });
  },
};

const getTask: AgentTool = {
  name: 'get_task',
  description: '读取任务详情及子任务、相关待办摘要。拆解前应先读取。',
  readOnly: true,
  parameters: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: '任务 id' },
    },
    required: ['taskId'],
    additionalProperties: false,
  },
  schema: taskIdSchema,
  async execute(args) {
    const { taskId } = taskIdSchema.parse(args);
    const context = await taskContextBuilder.build(taskId);
    return jsonResult({
      taskId: context.taskId,
      taskName: context.taskName,
      context: context.promptContext,
    });
  },
};

const decomposeGoal: AgentTool = {
  name: 'decompose_goal',
  description:
    '把你生成的目标拆解建议写入本条助手消息的工作台。必须先 get_goal 读上下文，再自行生成 suggestions 并传入（总量最多 8、每类最多 2；kind 为 goal/task/todo/habit）。不要只输出文本列表。创建实体由用户在工作台采纳。',
  parameters: {
    type: 'object',
    properties: {
      goalId: { type: 'string', description: '目标 id' },
      analysisSummary: { type: 'string', description: '简短分析摘要' },
      suggestions: {
        type: 'array',
        description: '拆解建议，必填',
        items: {
          type: 'object',
          properties: {
            kind: { type: 'string', enum: ['goal', 'task', 'todo', 'habit'] },
            ...suggestionItemProperties,
          },
          required: ['kind', 'title'],
          additionalProperties: false,
        },
      },
    },
    required: ['goalId', 'suggestions'],
    additionalProperties: false,
  },
  schema: decomposeGoalSchema,
  async execute(args, ctx) {
    const { goalId, analysisSummary, suggestions: drafts } = decomposeGoalSchema.parse(args);
    const [result, context] = await Promise.all([
      growthAi().getCapability<typeof drafts, { runId: string; analysisSummary: string; suggestions: AiWorkspaceSuggestionVo[] }>(
        GoalDecomposeKey,
      ).execute({
        goalId,
        analysisSummary,
        suggestions: drafts as AiSuggestionDraftVo[],
      } as never),
      goalContextBuilder.build(goalId),
    ]);
    const suggestions: AiWorkspaceSuggestionVo[] = result.suggestions.map((item) => ({ ...item }));
    ctx.appendWorkspace({
      type: 'workspace',
      workspaceKey: GoalDecomposeKey,
      payload: {
        runId: result.runId,
        analysisSummary: result.analysisSummary,
        suggestions,
        ref: { type: 'goal', id: context.goalId, label: context.goalName },
      },
    });
    return jsonResult({
      ok: true,
      runId: result.runId,
      suggestionCount: suggestions.length,
      analysisSummary: result.analysisSummary,
      hint: '工作台已写入本条助手消息，请提示用户打开工作台审阅。不要输出建议 JSON 列表。',
    });
  },
};

const decomposeTask: AgentTool = {
  name: 'decompose_task',
  description:
    '把你生成的任务拆解建议写入本条助手消息的工作台。必须先 get_task 读上下文，再自行生成 suggestions 并传入（仅 kind=task|todo；总量最多 8、每类最多 2）。不要只输出文本列表。创建实体由用户在工作台采纳。',
  parameters: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: '任务 id' },
      analysisSummary: { type: 'string', description: '简短分析摘要' },
      suggestions: {
        type: 'array',
        description: '子任务与待办建议，必填',
        items: {
          type: 'object',
          properties: {
            kind: { type: 'string', enum: ['task', 'todo'] },
            ...suggestionItemProperties,
          },
          required: ['kind', 'title'],
          additionalProperties: false,
        },
      },
    },
    required: ['taskId', 'suggestions'],
    additionalProperties: false,
  },
  schema: decomposeTaskSchema,
  async execute(args, ctx) {
    const { taskId, analysisSummary, suggestions: drafts } = decomposeTaskSchema.parse(args);
    const [result, context] = await Promise.all([
      growthAi().getCapability<typeof drafts, { runId: string; analysisSummary: string; suggestions: AiWorkspaceSuggestionVo[] }>(
        TaskDecomposeKey,
      ).execute({
        taskId,
        analysisSummary,
        suggestions: drafts as AiSuggestionDraftVo[],
      } as never),
      taskContextBuilder.build(taskId),
    ]);
    const suggestions: AiWorkspaceSuggestionVo[] = result.suggestions.map((item) => ({ ...item }));
    ctx.appendWorkspace({
      type: 'workspace',
      workspaceKey: TaskDecomposeKey,
      payload: {
        runId: result.runId,
        analysisSummary: result.analysisSummary,
        suggestions,
        ref: { type: 'task', id: context.taskId, label: context.taskName },
      },
    });
    return jsonResult({
      ok: true,
      runId: result.runId,
      suggestionCount: suggestions.length,
      analysisSummary: result.analysisSummary,
      hint: '工作台已写入本条助手消息，请提示用户打开工作台审阅。不要输出建议 JSON 列表。',
    });
  },
};

export const growthAgentTools: AgentTool[] = [
  searchGoals,
  searchTasks,
  getGoal,
  getTask,
  decomposeGoal,
  decomposeTask,
];
