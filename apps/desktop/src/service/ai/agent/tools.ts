import { z } from 'zod';
import type { AiSuggestionDraftVo, AiWorkspacePartVo, AiWorkspaceSuggestionVo } from '@true-north/vo';
import { GoalRepository } from '../../growth/goal/goal.repository';
import { GoalFilterDto } from '../../growth/goal/dto';
import { TaskRepository } from '../../growth/task/task.repository';
import { TaskFilterDto } from '../../growth/task/dto';
import type { ProviderTool } from '../provider/ai-provider';
import { capabilityRegistry } from '../capability/capability.registry';
import { goalContextBuilder } from '../context/goal-context.builder';
import { taskContextBuilder } from '../context/task-context.builder';

const SEARCH_CAP = 8;

export type ToolExecutionContext = {
  appendWorkspace: (part: AiWorkspacePartVo) => void;
};

export type AgentTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  schema: z.ZodTypeAny;
  execute: (args: Record<string, unknown>, ctx: ToolExecutionContext) => Promise<string>;
};

const keywordSchema = z.object({
  keyword: z.string().min(1),
});

const goalIdSchema = z.object({
  goalId: z.string().min(1),
});

const taskIdSchema = z.object({
  taskId: z.string().min(1),
});

const goalSuggestionDraftSchema = z.object({
  kind: z.enum(['goal', 'task', 'todo', 'habit']),
  title: z.string().min(1),
  reason: z.string().optional(),
  impact: z.string().optional(),
  planned: z.string().optional(),
  importance: z.coerce.number().optional(),
  difficulty: z.coerce.number().optional(),
});

const taskSuggestionDraftSchema = z.object({
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
  suggestions: z.array(goalSuggestionDraftSchema).min(1),
});

const decomposeTaskSchema = z.object({
  taskId: z.string().min(1),
  analysisSummary: z.string().optional(),
  suggestions: z.array(taskSuggestionDraftSchema).min(1),
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

function summarizeArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}=${value.length}项`;
      return `${key}=${String(value)}`;
    })
    .slice(0, 3);
  return entries.join(', ');
}

const searchGoals: AgentTool = {
  name: 'search_goals',
  description: '按关键词搜索目标，返回 id、名称与状态。不确定实体 id 时先搜索。',
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
      capabilityRegistry.getGoalDecompose().execute({
        goalId,
        analysisSummary,
        suggestions: drafts as AiSuggestionDraftVo[],
      }),
      goalContextBuilder.build(goalId),
    ]);
    const suggestions: AiWorkspaceSuggestionVo[] = result.suggestions.map((item) => ({ ...item }));
    ctx.appendWorkspace({
      type: 'workspace',
      workspaceKey: 'goal.decompose',
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
      capabilityRegistry.getTaskDecompose().execute({
        taskId,
        analysisSummary,
        suggestions: drafts as AiSuggestionDraftVo[],
      }),
      taskContextBuilder.build(taskId),
    ]);
    const suggestions: AiWorkspaceSuggestionVo[] = result.suggestions.map((item) => ({ ...item }));
    ctx.appendWorkspace({
      type: 'workspace',
      workspaceKey: 'task.decompose',
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

export const agentTools: AgentTool[] = [
  searchGoals,
  searchTasks,
  getGoal,
  getTask,
  decomposeGoal,
  decomposeTask,
];

const toolsByName = new Map(agentTools.map((tool) => [tool.name, tool]));

export function listProviderTools(): ProviderTool[] {
  return agentTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}

export function findAgentTool(name: string): AgentTool | undefined {
  return toolsByName.get(name);
}

export function summarizeToolArgs(args: Record<string, unknown>): string {
  return summarizeArgs(args);
}

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<{ ok: boolean; result: string; args: Record<string, unknown> }> {
  const tool = findAgentTool(name);
  if (!tool) {
    return { ok: false, result: `未知工具: ${name}`, args };
  }
  try {
    const parsed = tool.schema.parse(args) as Record<string, unknown>;
    const result = await tool.execute(parsed, ctx);
    return { ok: true, result, args: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        result: '工具参数无效，请按该工具 schema 修正后重试。',
        args,
      };
    }
    const message = error instanceof Error ? error.message : '工具执行失败';
    return { ok: false, result: message, args };
  }
}

export function parseToolArguments(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}
