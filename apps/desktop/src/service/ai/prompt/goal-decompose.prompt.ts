import type { ProviderMessage } from '../provider/ai-provider';

export const GOAL_DECOMPOSE_SCHEMA_HINT = `{
  "analysisSummary": string,
  "suggestions": Array<{
    "kind": "goal" | "task" | "todo" | "habit",
    "title": string,
    "reason": string,
    "impact": string,
    "planned": "YYYY-MM-DD",
    "importance": number,
    "difficulty": number
  }>
}`;

/** JSON contract only; domain persona comes from growth.goal skill. */
export function buildGoalDecomposeMessages(contextText: string): ProviderMessage[] {
  return [
    {
      role: 'system',
      content: [
        '只输出一个 JSON 对象，不要 markdown，不要额外说明。',
        '建议类型仅允许 goal（子目标）、task、todo、habit。',
        '建议应具体可执行，标题简洁；planned 使用 YYYY-MM-DD；importance/difficulty 为 1-5 整数。',
        '尽量覆盖多种类型，但不要编造与上下文明显矛盾的内容。',
        `JSON 约定：${GOAL_DECOMPOSE_SCHEMA_HINT}`,
      ].join('\n'),
    },
    {
      role: 'user',
      content: `请基于以下目标上下文生成拆解建议：\n\n${contextText}`,
    },
  ];
}
