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
      return '当前 AI 能力不可用，请确认本机 ChatGPT 已安装并登录';
    case AiErrorCode.PROVIDER_HTTP:
      return '模型服务拒绝请求或鉴权失败';
    case AiErrorCode.TIMEOUT:
      return '模型请求超时，请稍后重试';
    case AiErrorCode.INVALID_MODEL_OUTPUT:
      return '拆解建议格式无效，请重新生成';
    case AiErrorCode.CONTEXT_NOT_FOUND:
      return '目标或任务不存在或已删除';
    case AiErrorCode.AGENT_UNAVAILABLE:
      return '本机未安装所选编码 Agent，或当前没有可用 Agent';
    case AiErrorCode.AGENT_UNAUTHENTICATED:
      return '所选编码 Agent 已安装但尚未登录';
    case AiErrorCode.INTERNAL:
    default:
      return fallback || 'AI 请求失败，请重试';
  }
}
