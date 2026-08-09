import { AiErrorCode } from '@true-north/enum';

const AI_ERROR_CODES = new Set<string>(Object.values(AiErrorCode));

export function parseAiError(error: unknown): { code: AiErrorCode; message: string } {
  const raw = error instanceof Error ? error.message : String(error ?? '未知错误');
  const match = raw.match(/^([A-Z_]+):\s*(.*)$/);
  if (match && AI_ERROR_CODES.has(match[1])) {
    return { code: match[1] as AiErrorCode, message: match[2] || raw };
  }
  return { code: AiErrorCode.INTERNAL, message: raw };
}

export function aiErrorUserMessage(code: AiErrorCode, fallback?: string): string {
  switch (code) {
    case AiErrorCode.NOT_CONFIGURED:
      return '主进程 AI 配置不可用，请检查 ai.config.ts 中的 baseUrl/model/apiKey';
    case AiErrorCode.PROVIDER_HTTP:
      return '模型服务拒绝请求或鉴权失败，请检查 Key 与 URL';
    case AiErrorCode.TIMEOUT:
      return '模型请求超时，请稍后重试';
    case AiErrorCode.INVALID_MODEL_OUTPUT:
      return '模型输出无法解析，请重新生成';
    case AiErrorCode.CONTEXT_NOT_FOUND:
      return '目标不存在或已删除';
    case AiErrorCode.INTERNAL:
    default:
      return fallback || 'AI 拆解失败，请重试';
  }
}
