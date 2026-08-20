import { randomUUID } from 'crypto';
import { z } from 'zod';
import { AiCapabilityKey, AiSuggestionKind } from '@true-north/enum';
import type { AiSuggestionVo, TaskDecomposeRequestVo, TaskDecomposeResponseVo } from '@true-north/vo';
import { AiPlatformError } from '../ai-error';
import { aiSuggestionCacheService, fingerprintPromptContext } from '../cache/ai-suggestion-cache.service';
import { taskContextBuilder } from '../context/task-context.builder';

const TOTAL_CAP = 8;
const PER_KIND_CAP = 2;
const REF_TYPE = 'task';
const ALLOWED_KINDS = new Set([AiSuggestionKind.TASK, AiSuggestionKind.TODO, 'task', 'todo']);

const suggestionDraftSchema = z.object({
  kind: z.enum(['task', 'todo']),
  title: z.string(),
  reason: z.string().optional(),
  impact: z.string().optional(),
  planned: z.string().optional(),
  importance: z.coerce.number().optional(),
  difficulty: z.coerce.number().optional(),
});

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function detectConflict(title: string, childTitles: string[]): string | undefined {
  const normalized = normalizeTitle(title);
  if (!normalized) return undefined;
  for (const child of childTitles) {
    const childNorm = normalizeTitle(child);
    if (!childNorm) continue;
    if (normalized === childNorm || normalized.includes(childNorm) || childNorm.includes(normalized)) {
      return '已存在相近子任务';
    }
  }
  return undefined;
}

function clampNumber(value: unknown, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(5, Math.max(1, Math.round(num)));
}

function refreshConflicts(suggestions: AiSuggestionVo[], childTaskTitles: string[]): AiSuggestionVo[] {
  return suggestions.map((item) => {
    const conflict =
      item.kind === AiSuggestionKind.TASK ? detectConflict(item.title, childTaskTitles) : undefined;
    return { ...item, conflict };
  });
}

function normalizeSuggestions(
  drafts: Array<z.infer<typeof suggestionDraftSchema>>,
  runId: string,
  childTaskTitles: string[]
): AiSuggestionVo[] {
  const kindCounts: Record<string, number> = {};
  const suggestions: AiSuggestionVo[] = [];

  for (const item of drafts) {
    const title = item.title?.trim();
    if (!title) continue;
    if (!ALLOWED_KINDS.has(item.kind)) continue;

    const kind = item.kind as AiSuggestionKind;
    const count = kindCounts[kind] || 0;
    if (count >= PER_KIND_CAP) continue;
    if (suggestions.length >= TOTAL_CAP) break;

    kindCounts[kind] = count + 1;
    const conflict = kind === AiSuggestionKind.TASK ? detectConflict(title, childTaskTitles) : undefined;
    suggestions.push({
      id: `${runId}-${suggestions.length}`,
      kind,
      title,
      reason: item.reason?.trim() || '基于当前任务上下文生成。',
      impact: item.impact?.trim() || '有助于推进任务落地。',
      planned: item.planned?.trim() || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      importance: clampNumber(item.importance, 3),
      difficulty: clampNumber(item.difficulty, 2),
      conflict,
    });
  }

  return suggestions;
}

export class TaskDecomposeCapability {
  readonly key = AiCapabilityKey.TASK_DECOMPOSE;

  async execute(input: TaskDecomposeRequestVo): Promise<TaskDecomposeResponseVo> {
    const context = await taskContextBuilder.build(input.taskId);
    const contextFingerprint = fingerprintPromptContext(context.promptContext);

    const hasDrafts = Array.isArray(input.suggestions) && input.suggestions.length > 0;
    if (!hasDrafts) {
      const cached = await aiSuggestionCacheService.findMatching({
        capabilityKey: this.key,
        refType: REF_TYPE,
        refId: input.taskId,
        contextFingerprint,
      });
      if (cached) {
        return {
          runId: cached.runId,
          analysisSummary: cached.analysisSummary,
          suggestions: refreshConflicts(cached.suggestions, context.childTaskTitles),
        };
      }
      throw AiPlatformError.invalidModelOutput(
        '必须传入 suggestions。请先调用 get_task 读取上下文，再按 schema 生成子任务/待办建议后重试。'
      );
    }

    const parsedDrafts = z.array(suggestionDraftSchema).safeParse(input.suggestions);
    if (!parsedDrafts.success) {
      throw AiPlatformError.invalidModelOutput(
        'suggestions 格式无效。每条需含 kind（task|todo）与 title；总量最多 8、每类最多 2。不要输出 goal 或 habit。'
      );
    }

    const runId = randomUUID();
    const suggestions = normalizeSuggestions(parsedDrafts.data, runId, context.childTaskTitles);
    if (!suggestions.length) {
      throw AiPlatformError.invalidModelOutput(
        '没有合法建议。请传入至少一条含 kind（task|todo）与非空 title 的建议。'
      );
    }

    const response: TaskDecomposeResponseVo = {
      runId,
      analysisSummary:
        input.analysisSummary?.trim() || `基于任务「${context.taskName}」生成 ${suggestions.length} 条建议。`,
      suggestions,
    };

    await aiSuggestionCacheService.upsert({
      capabilityKey: this.key,
      refType: REF_TYPE,
      refId: input.taskId,
      contextFingerprint,
      response,
    });

    return response;
  }
}

export const taskDecomposeCapability = new TaskDecomposeCapability();
