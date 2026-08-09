import { z } from 'zod';
import { AiCapabilityKey, AiSuggestionKind } from '@true-north/enum';
import type { AiSuggestionVo, GoalDecomposeRequestVo, GoalDecomposeResponseVo } from '@true-north/vo';
import {
  aiSuggestionCacheService,
  fingerprintPromptContext,
} from '../cache/ai-suggestion-cache.service';
import { completionRunner } from '../completion/completion.runner';
import { goalContextBuilder } from '../context/goal-context.builder';
import { promptRegistry } from '../prompt/prompt.registry';

const TOTAL_CAP = 8;
const PER_KIND_CAP = 2;
const REF_TYPE = 'goal';

const modelOutputSchema = z.object({
  analysisSummary: z.string().optional(),
  suggestions: z
    .array(
      z.object({
        kind: z.enum(['goal', 'task', 'todo', 'habit']),
        title: z.string(),
        reason: z.string().optional(),
        impact: z.string().optional(),
        planned: z.string().optional(),
        importance: z.number().optional(),
        difficulty: z.number().optional(),
      })
    )
    .default([]),
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
      return '已存在相近子目标';
    }
  }
  return undefined;
}

function clampNumber(value: unknown, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(5, Math.max(1, Math.round(num)));
}

function refreshConflicts(
  suggestions: AiSuggestionVo[],
  childGoalTitles: string[]
): AiSuggestionVo[] {
  return suggestions.map((item) => {
    const conflict =
      item.kind === AiSuggestionKind.GOAL || item.kind === 'goal'
        ? detectConflict(item.title, childGoalTitles)
        : undefined;
    return { ...item, conflict };
  });
}

export class GoalDecomposeCapability {
  readonly key = AiCapabilityKey.GOAL_DECOMPOSE;

  async execute(input: GoalDecomposeRequestVo): Promise<GoalDecomposeResponseVo> {
    const context = await goalContextBuilder.build(input.goalId);
    const contextFingerprint = fingerprintPromptContext(context.promptContext);

    if (!input.forceRefresh) {
      const cached = await aiSuggestionCacheService.findMatching({
        capabilityKey: this.key,
        refType: REF_TYPE,
        refId: input.goalId,
        contextFingerprint,
      });
      if (cached) {
        return {
          runId: cached.runId,
          analysisSummary: cached.analysisSummary,
          suggestions: refreshConflicts(cached.suggestions, context.childGoalTitles),
        };
      }
    }

    const prompt = promptRegistry.build(this.key, { contextText: context.promptContext });

    const result = await completionRunner.complete({
      capabilityKey: this.key,
      messages: prompt.messages,
      responseFormat: 'json',
      schema: modelOutputSchema,
      schemaHint: prompt.schemaHint,
      ref: { type: REF_TYPE, id: input.goalId },
      temperature: 0.4,
    });

    const parsed = modelOutputSchema.parse(result.parsed);
    const kindCounts: Record<string, number> = {};
    const suggestions: AiSuggestionVo[] = [];

    for (const item of parsed.suggestions) {
      const title = item.title?.trim();
      if (!title) continue;
      if (!Object.values(AiSuggestionKind).includes(item.kind as AiSuggestionKind)) continue;

      const kind = item.kind as AiSuggestionKind;
      const count = kindCounts[kind] || 0;
      if (count >= PER_KIND_CAP) continue;
      if (suggestions.length >= TOTAL_CAP) break;

      kindCounts[kind] = count + 1;
      const conflict = kind === AiSuggestionKind.GOAL ? detectConflict(title, context.childGoalTitles) : undefined;
      suggestions.push({
        id: `${result.runId}-${suggestions.length}`,
        kind,
        title,
        reason: item.reason?.trim() || '基于当前目标上下文生成。',
        impact: item.impact?.trim() || '有助于推进目标落地。',
        planned: item.planned?.trim() || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        importance: clampNumber(item.importance, 3),
        difficulty: clampNumber(item.difficulty, 2),
        conflict,
      });
    }

    const response: GoalDecomposeResponseVo = {
      runId: result.runId,
      analysisSummary:
        parsed.analysisSummary?.trim() ||
        `基于目标「${context.goalName}」生成 ${suggestions.length} 条建议。`,
      suggestions,
    };

    await aiSuggestionCacheService.upsert({
      capabilityKey: this.key,
      refType: REF_TYPE,
      refId: input.goalId,
      contextFingerprint,
      response,
    });

    return response;
  }
}

export const goalDecomposeCapability = new GoalDecomposeCapability();
