import type { ProviderMessage } from '../provider/ai-provider';

export function buildJsonRepairMessages(
  previousMessages: ProviderMessage[],
  invalidContent: string,
  schemaHint: string
): ProviderMessage[] {
  return [
    ...previousMessages,
    { role: 'assistant', content: invalidContent },
    {
      role: 'user',
      content: `上一次输出不是合法 JSON 或不符合约定字段。请只输出一个 JSON 对象，不要包含 markdown 代码块或其它说明。字段约定：\n${schemaHint}`,
    },
  ];
}

export function extractJsonText(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}
