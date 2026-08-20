import { AiErrorCode } from '@true-north/enum';

const AI_ERROR_CODES = new Set<string>(Object.values(AiErrorCode));

export class AiPlatformError extends Error {
  readonly aiCode: AiErrorCode;

  constructor(aiCode: AiErrorCode, message: string) {
    super(message);
    this.name = 'AiPlatformError';
    this.aiCode = aiCode;
  }

  toIpcMessage(): string {
    return `${this.aiCode}: ${this.message}`;
  }

  static notConfigured(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.NOT_CONFIGURED, message);
  }

  static providerHttp(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.PROVIDER_HTTP, message);
  }

  static timeout(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.TIMEOUT, message);
  }

  static invalidModelOutput(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.INVALID_MODEL_OUTPUT, message);
  }

  static contextNotFound(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.CONTEXT_NOT_FOUND, message);
  }

  static agentUnavailable(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.AGENT_UNAVAILABLE, message);
  }

  static agentUnauthenticated(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.AGENT_UNAUTHENTICATED, message);
  }

  static internal(message: string): AiPlatformError {
    return new AiPlatformError(AiErrorCode.INTERNAL, message);
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
  return { code: AiErrorCode.INTERNAL, message: raw };
}

export function toIpcError(error: unknown): Error {
  if (error instanceof AiPlatformError) {
    return new Error(error.toIpcMessage());
  }
  const parsed = parseAiError(error);
  return new Error(`${parsed.code}: ${parsed.message}`);
}
