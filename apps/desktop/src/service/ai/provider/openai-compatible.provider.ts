import { z } from 'zod';
import { AiProviderKind } from '@true-north/enum';
import { AiPlatformError } from '../ai-error';
import { normalizeAiBaseUrl } from '../ai.config';
import type { AiProvider, ProviderCompleteRequest, ProviderCompleteResult } from './ai-provider';

const chatCompletionSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable().optional(),
        }),
      })
    )
    .min(1),
});

function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'function') {
    return { signal: (AbortSignal as any).timeout(timeoutMs), clear: () => undefined };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function extractUpstreamErrorMessage(errBody: string): string {
  try {
    const parsedErr = JSON.parse(errBody);
    return parsedErr?.message || parsedErr?.error?.message || parsedErr?.code || '';
  } catch {
    return errBody.slice(0, 120);
  }
}

export class OpenAICompatibleProvider implements AiProvider {
  kind = AiProviderKind.OPENAI_COMPATIBLE;

  async complete(req: ProviderCompleteRequest): Promise<ProviderCompleteResult> {
    const baseUrl = normalizeAiBaseUrl(req.baseUrl);
    const url = `${baseUrl}/chat/completions`;
    const body: Record<string, unknown> = {
      model: req.model,
      messages: req.messages,
    };
    if (req.temperature !== undefined) body.temperature = req.temperature;
    if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens;
    if (req.jsonMode) body.response_format = { type: 'json_object' };

    const { signal, clear } = createTimeoutSignal(req.timeoutMs);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${req.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        let errBody = '';
        try {
          errBody = (await response.text()).slice(0, 400);
        } catch {
          errBody = '';
        }
        const upstreamMessage = extractUpstreamErrorMessage(errBody);
        const detail = upstreamMessage ? `（${upstreamMessage}）` : '';
        throw AiPlatformError.providerHttp(`模型服务返回 HTTP ${response.status}${detail}`);
      }

      const json = await response.json();
      const parsed = chatCompletionSchema.safeParse(json);
      if (!parsed.success) {
        throw AiPlatformError.invalidModelOutput('模型响应缺少 choices[0].message.content');
      }
      const content = parsed.data.choices[0]?.message?.content;
      if (!content?.trim()) {
        throw AiPlatformError.invalidModelOutput('模型响应内容为空');
      }
      return { content };
    } catch (error) {
      if (error instanceof AiPlatformError) throw error;
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        throw AiPlatformError.timeout('模型请求超时');
      }
      throw AiPlatformError.providerHttp(error instanceof Error ? error.message : '模型请求失败');
    } finally {
      clear();
    }
  }
}
