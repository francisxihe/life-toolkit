import type { ProviderMessage } from '../provider/ai-provider';

export const TASK_DECOMPOSE_SCHEMA_HINT = `{
  "analysisSummary": string,
  "suggestions": Array<{
    "kind": "task" | "todo",
    "title": string,
    "reason": string,
    "impact": string,
    "planned": "YYYY-MM-DD",
    "importance": number,
    "difficulty": number
  }>
}`;

/** JSON contract only; domain persona comes from growth.task skill. */
export function buildTaskDecomposeMessages(contextText: string): ProviderMessage[] {
  return [
    {
      role: 'system',
      content: [
        '只输出一个 JSON 对象，不要 markdown，不要额外说明。',
        '建议类型仅允许 task（子任务）、todo（待办）。不要输出 goal 或 habit。',
        '建议应具体可执行，标题简洁；planned 使用 YYYY-MM-DD；importance/difficulty 为 1-5 整数。',
        '不要编造与上下文明显矛盾的内容。',
        `JSON 约定：${TASK_DECOMPOSE_SCHEMA_HINT}`,
      ].join('\n'),
    },
    {
      role: 'user',
      content: `请基于以下任务上下文生成拆解建议：\n\n${contextText}`,
    },
  ];
}
