import type { ZodTypeAny } from 'zod';
import { AiCapabilityKey, AiProviderKind, AiRunStatus } from '@true-north/enum';
import { assertAiConfigured, getAiConfig, normalizeAiBaseUrl } from '../ai.config';
import { AiPlatformError, parseAiError } from '../ai-error';
import { aiProviderRegistry } from '../provider/provider.registry';
import type { ProviderMessage } from '../provider/ai-provider';
import { aiRunService } from '../run/ai-run.service';
import { buildJsonRepairMessages, extractJsonText } from './json-repair';

export type CompletionInput = {
  capabilityKey: AiCapabilityKey | string;
  messages: ProviderMessage[];
  responseFormat: 'json' | 'text';
  schema?: ZodTypeAny;
  schemaHint?: string;
  ref?: { type: string; id: string };
  temperature?: number;
};

export type CompletionResult = {
  content: string;
  parsed?: unknown;
  runId: string;
};

function hostOf(baseUrl: string): string {
  try {
    return new URL(normalizeAiBaseUrl(baseUrl)).host;
  } catch {
    return baseUrl;
  }
}

export class CompletionRunner {
  async complete(input: CompletionInput): Promise<CompletionResult> {
    const cfg = getAiConfig();
    assertAiConfigured(cfg);

    const provider = aiProviderRegistry.get(cfg.providerKind);
    const startedAt = Date.now();
    const run = await aiRunService.start({
      capabilityKey: input.capabilityKey,
      providerKind: cfg.providerKind as AiProviderKind,
      model: cfg.model,
      baseUrlHost: hostOf(cfg.baseUrl),
      requestSummary: JSON.stringify({
        messages: input.messages.map((m) => ({ role: m.role, chars: m.content.length })),
        responseFormat: input.responseFormat,
      }),
      refType: input.ref?.type,
      refId: input.ref?.id,
    });

    try {
      let messages = input.messages;
      let content = (
        await provider.complete({
          baseUrl: cfg.baseUrl,
          apiKey: cfg.apiKey,
          model: cfg.model,
          messages,
          timeoutMs: cfg.timeoutMs,
          temperature: input.temperature,
          maxTokens: cfg.maxTokens,
          jsonMode: input.responseFormat === 'json',
        })
      ).content;

      let parsed: unknown | undefined;
      if (input.responseFormat === 'json') {
        parsed = this.parseJson(content, input.schema);
        if (parsed === undefined) {
          messages = buildJsonRepairMessages(messages, content, input.schemaHint || '请输出合法 JSON 对象');
          content = (
            await provider.complete({
              baseUrl: cfg.baseUrl,
              apiKey: cfg.apiKey,
              model: cfg.model,
              messages,
              timeoutMs: cfg.timeoutMs,
              temperature: input.temperature,
              maxTokens: cfg.maxTokens,
              jsonMode: true,
            })
          ).content;
          parsed = this.parseJson(content, input.schema);
          if (parsed === undefined) {
            throw AiPlatformError.invalidModelOutput('模型输出无法解析为约定 JSON');
          }
        }
      }

      await aiRunService.finish(run.id, {
        status: AiRunStatus.SUCCEEDED,
        responseSummary: content,
        latencyMs: Date.now() - startedAt,
      });

      return { content, parsed, runId: run.id };
    } catch (error) {
      const parsed = parseAiError(error);
      await aiRunService.finish(run.id, {
        status: AiRunStatus.FAILED,
        errorCode: parsed.code,
        errorMessage: parsed.message,
        latencyMs: Date.now() - startedAt,
      });
      if (error instanceof AiPlatformError) throw error;
      throw new AiPlatformError(parsed.code, parsed.message);
    }
  }

  private parseJson(content: string, schema?: ZodTypeAny): unknown | undefined {
    try {
      const jsonText = extractJsonText(content);
      const value = JSON.parse(jsonText);
      if (!schema) return value;
      const result = schema.safeParse(value);
      return result.success ? result.data : undefined;
    } catch {
      return undefined;
    }
  }
}

export const completionRunner = new CompletionRunner();
