import type { AiErrorCode } from '@true-north/enum';

const AI_ERROR_CODES = new Set<string>([
  'NOT_CONFIGURED',
  'PROVIDER_HTTP',
  'TIMEOUT',
  'INVALID_MODEL_OUTPUT',
  'CONTEXT_NOT_FOUND',
  'AGENT_UNAVAILABLE',
  'AGENT_UNAUTHENTICATED',
  'INTERNAL',
]);

export class AiPlatformError extends Error {
  readonly aiCode: AiErrorCode;

  constructor(aiCode: AiErrorCode, message: string) {
    super(message);
    this.name = 'AiPlatformError';
    this.constructor = AiPlatformError;
    this.aiCode = aiCode;
  }

  toIpcMessage(): string {
    return `${this.aiCode}: ${this.message}`;
  }

  static invalidModelOutput(message: string): AiPlatformError {
    return new AiPlatformError('INVALID_MODEL_OUTPUT' as AiErrorCode, message);
  }

  static contextNotFound(message: string): AiPlatformError {
    return new AiPlatformError('CONTEXT_NOT_FOUND' as AiErrorCode, message);
  }

  static agentUnavailable(message: string): AiPlatformError {
    return new AiPlatformError('AGENT_UNAVAILABLE' as AiErrorCode, message);
  }

  static agentUnauthenticated(message: string): AiPlatformError {
    return new AiPlatformError('AGENT_UNAUTHENTICATED' as AiErrorCode, message);
  }

  static internal(message: string): AiPlatformError {
    return new AiPlatformError('INTERNAL' as AiErrorCode, message);
  }
}

export function parseAiError(error: unknown): { code: AiErrorCode; message: string } {
  const raw =
    error instanceof AiPlatformError
      ? error.toIpcMessage()
      : error instanceof Error
        ? error.message
        : String(error ?? '未知错误');

  const match = raw.match(/^([A-Z_]+):\s*(.*)$/);
  if (match && AI_ERROR_CODES.has(match[1])) {
    return { code: match[1] as AiErrorCode, message: match[2] || raw };
  }
  if (error instanceof AiPlatformError) {
    return { code: error.aiCode, message: error.message };
  }
  return { code: 'INTERNAL' as AiErrorCode, message: raw };
}

export function toIpcError(error: unknown): Error {
  if (error instanceof AiPlatformError) {
    return new Error(error.toIpcMessage());
  }
  const parsed = parseAiError(error);
  return new Error(`${parsed.code}: ${parsed.message}`);
}
