import { randomUUID } from 'crypto';
import { z } from 'zod';
import { AiSuggestionKind, GoalDecomposeKey } from '@true-north/enum';
import type { AiSuggestionVo, GoalDecomposeRequestVo, GoalDecomposeResponseVo } from '@true-north/vo';
import { AiPlatformError } from '@true-north/plugin-sdk';
import { growthAi } from '../../context';
import { goalContextBuilder } from './goal-context.builder';

const TOTAL_CAP = 8;
const PER_KIND_CAP = 2;
const REF_TYPE = 'goal';

const suggestionDraftSchema = z.object({
  kind: z.enum(['goal', 'task', 'todo', 'habit']),
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

function refreshConflicts(suggestions: AiSuggestionVo[], childGoalTitles: string[]): AiSuggestionVo[] {
  return suggestions.map((item) => {
    const conflict =
      item.kind === AiSuggestionKind.GOAL ? detectConflict(item.title, childGoalTitles) : undefined;
    return { ...item, conflict };
  });
}

function normalizeSuggestions(
  drafts: Array<z.infer<typeof suggestionDraftSchema>>,
  runId: string,
  childGoalTitles: string[]
): AiSuggestionVo[] {
  const kindCounts: Record<string, number> = {};
  const suggestions: AiSuggestionVo[] = [];

  for (const item of drafts) {
    const title = item.title?.trim();
    if (!title) continue;
    if (!Object.values(AiSuggestionKind).includes(item.kind as AiSuggestionKind)) continue;

    const kind = item.kind as AiSuggestionKind;
    const count = kindCounts[kind] || 0;
    if (count >= PER_KIND_CAP) continue;
    if (suggestions.length >= TOTAL_CAP) break;

    kindCounts[kind] = count + 1;
    const conflict = kind === AiSuggestionKind.GOAL ? detectConflict(title, childGoalTitles) : undefined;
    suggestions.push({
      id: `${runId}-${suggestions.length}`,
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

  return suggestions;
}

export class GoalDecomposeCapability {
  readonly key = GoalDecomposeKey;

  async execute(input: GoalDecomposeRequestVo): Promise<GoalDecomposeResponseVo> {
    const context = await goalContextBuilder.build(input.goalId);
    const contextFingerprint = growthAi().cache.fingerprintPromptContext(context.promptContext);

    const hasDrafts = Array.isArray(input.suggestions) && input.suggestions.length > 0;
    if (!hasDrafts) {
      const cached = await growthAi().cache.findMatching<GoalDecomposeResponseVo>({
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
      throw AiPlatformError.invalidModelOutput(
        '必须传入 suggestions。请先调用 get_goal 读取上下文，再按 schema 生成建议后重试。'
      );
    }

    const parsedDrafts = z.array(suggestionDraftSchema).safeParse(input.suggestions);
    if (!parsedDrafts.success) {
      throw AiPlatformError.invalidModelOutput(
        'suggestions 格式无效。每条需含 kind（goal|task|todo|habit）与 title；总量最多 8、每类最多 2。'
      );
    }

    const runId = randomUUID();
    const suggestions = normalizeSuggestions(parsedDrafts.data, runId, context.childGoalTitles);
    if (!suggestions.length) {
      throw AiPlatformError.invalidModelOutput(
        '没有合法建议。请传入至少一条含 kind 与非空 title 的建议（goal|task|todo|habit）。'
      );
    }

    const response: GoalDecomposeResponseVo = {
      runId,
      analysisSummary:
        input.analysisSummary?.trim() || `基于目标「${context.goalName}」生成 ${suggestions.length} 条建议。`,
      suggestions,
    };

    await growthAi().cache.upsert({
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
