import { z } from 'zod';
import { ActivityCaptureKey } from '@true-north/enum';
import { getAiCapability, type AgentTool } from '@true-north/plugin-sdk';

const captureDraftSchema = z.object({
  kind: z.enum(['todo', 'expense', 'purchase', 'bookmark']),
  title: z.string().min(1),
  planned: z.string().optional(),
  amount: z.coerce.number().optional(),
  transactionType: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  occurredAt: z.string().optional(),
  quantity: z.coerce.number().optional(),
  unit: z.string().optional(),
  neededAt: z.string().optional(),
  url: z.string().optional(),
});

const captureSchema = z.object({
  analysisSummary: z.string().optional(),
  sourceText: z.string().optional(),
  suggestions: z.array(captureDraftSchema).min(1),
});

const captureActivity: AgentTool = {
  name: 'capture_activity',
  description:
    '把用户一句话里的待办、支出、采购或收藏理解成结构化建议，写入本条助手消息的收集工作台。不要创建实体。金额、日期、网址尽量填全；一句里有多件事就拆成多条。看起来像网址时 kind 用 bookmark。',
  parameters: {
    type: 'object',
    properties: {
      analysisSummary: { type: 'string', description: '简短理解摘要' },
      sourceText: { type: 'string', description: '用户原话' },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            kind: { type: 'string', enum: ['todo', 'expense', 'purchase', 'bookmark'] },
            title: { type: 'string' },
            planned: { type: 'string', description: 'YYYY-MM-DD' },
            amount: { type: 'number' },
            transactionType: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string' },
            note: { type: 'string' },
            occurredAt: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            neededAt: { type: 'string' },
            url: { type: 'string' },
          },
          required: ['kind', 'title'],
          additionalProperties: false,
        },
      },
    },
    required: ['suggestions'],
    additionalProperties: false,
  },
  schema: captureSchema,
  async execute(args, ctx) {
    const parsed = captureSchema.parse(args);
    const result = await getAiCapability<typeof parsed, { runId: string; suggestions: unknown[] }>(
      ActivityCaptureKey,
    ).execute(parsed);
    ctx.appendWorkspace({
      type: 'workspace',
      workspaceKey: ActivityCaptureKey,
      payload: { ...result },
    });
    return JSON.stringify({
      ok: true,
      runId: result.runId,
      suggestionCount: result.suggestions.length,
      hint: '收集预览已写入工作台，请提示用户确认。不要输出建议 JSON 列表。',
    });
  },
};

export const activityAgentTools: AgentTool[] = [captureActivity];
