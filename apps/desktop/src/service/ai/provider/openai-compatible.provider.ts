import { z } from 'zod';
import { AiProviderKind } from '@true-north/enum';
import { AiPlatformError } from '../ai-error';
import { normalizeAiBaseUrl } from '../ai.config';
import type {
  AiProvider,
  ProviderCompleteRequest,
  ProviderCompleteResult,
  ProviderMessage,
  ProviderStreamChunk,
  ProviderTool,
  ProviderToolCall,
} from './ai-provider';

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

function createTimeoutSignal(
  timeoutMs: number,
  external?: AbortSignal
): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (external) {
    if (external.aborted) {
      controller.abort();
    } else {
      external.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
      if (external) external.removeEventListener('abort', onExternalAbort);
    },
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

function mapFetchError(error: unknown): never {
  if (error instanceof AiPlatformError) throw error;
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    throw AiPlatformError.timeout('模型请求超时或已取消');
  }
  throw AiPlatformError.providerHttp(error instanceof Error ? error.message : '模型请求失败');
}

function toOpenAiMessages(messages: ProviderMessage[]): Array<Record<string, unknown>> {
  return messages.map((item) => {
    if (item.role === 'tool') {
      return {
        role: 'tool',
        tool_call_id: item.toolCallId,
        content: item.content || '',
      };
    }
    if (item.role === 'assistant' && item.toolCalls?.length) {
      return {
        role: 'assistant',
        content: item.content || null,
        tool_calls: item.toolCalls.map((call) => ({
          id: call.id,
          type: 'function',
          function: {
            name: call.name,
            arguments: call.arguments || '{}',
          },
        })),
      };
    }
    return {
      role: item.role,
      content: item.content || '',
    };
  });
}

function toOpenAiTools(tools?: ProviderTool[]): Array<Record<string, unknown>> | undefined {
  if (!tools?.length) return undefined;
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

type SseParsedEvent = {
  content?: string;
  finishReason?: string | null;
  toolCallDeltas?: Array<{
    index: number;
    id?: string;
    name?: string;
    arguments?: string;
  }>;
};

async function* parseSseStream(body: ReadableStream<Uint8Array>): AsyncGenerator<SseParsedEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const segments = buffer.split('\n');
      buffer = segments.pop() || '';

      for (const rawLine of segments) {
        const line = rawLine.trimEnd();
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') {
          if (data === '[DONE]') return;
          continue;
        }
        try {
          const json = JSON.parse(data) as {
            choices?: Array<{
              finish_reason?: string | null;
              delta?: {
                content?: string | null;
                tool_calls?: Array<{
                  index?: number;
                  id?: string;
                  function?: { name?: string; arguments?: string };
                }>;
              };
            }>;
          };
          const choice = json.choices?.[0];
          if (!choice) continue;
          const event: SseParsedEvent = {};
          const delta = choice.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            event.content = delta;
          }
          if (choice.delta?.tool_calls?.length) {
            event.toolCallDeltas = choice.delta.tool_calls.map((item, fallbackIndex) => ({
              index: typeof item.index === 'number' ? item.index : fallbackIndex,
              id: item.id,
              name: item.function?.name,
              arguments: item.function?.arguments,
            }));
          }
          if (choice.finish_reason) {
            event.finishReason = choice.finish_reason;
          }
          if (event.content || event.toolCallDeltas || event.finishReason) {
            yield event;
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export class OpenAICompatibleProvider implements AiProvider {
  kind = AiProviderKind.OPENAI_COMPATIBLE;

  async complete(req: ProviderCompleteRequest): Promise<ProviderCompleteResult> {
    const baseUrl = normalizeAiBaseUrl(req.baseUrl);
    const url = `${baseUrl}/chat/completions`;
    const body: Record<string, unknown> = {
      model: req.model,
      messages: toOpenAiMessages(req.messages),
    };
    if (req.temperature !== undefined) body.temperature = req.temperature;
    if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens;
    if (req.jsonMode) body.response_format = { type: 'json_object' };
    const tools = toOpenAiTools(req.tools);
    if (tools) body.tools = tools;

    const { signal, clear } = createTimeoutSignal(req.timeoutMs, req.signal);
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
      mapFetchError(error);
    } finally {
      clear();
    }
  }

  async *stream(req: ProviderCompleteRequest): AsyncIterable<ProviderStreamChunk> {
    const baseUrl = normalizeAiBaseUrl(req.baseUrl);
    const url = `${baseUrl}/chat/completions`;
    const body: Record<string, unknown> = {
      model: req.model,
      messages: toOpenAiMessages(req.messages),
      stream: true,
    };
    if (req.temperature !== undefined) body.temperature = req.temperature;
    if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens;
    const tools = toOpenAiTools(req.tools);
    if (tools) body.tools = tools;

    const { signal, clear } = createTimeoutSignal(req.timeoutMs, req.signal);
    const toolAcc = new Map<number, ProviderToolCall>();
    let finishReason = 'stop';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${req.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
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

      if (!response.body) {
        throw AiPlatformError.providerHttp('模型流式响应缺少 body');
      }

      for await (const event of parseSseStream(response.body)) {
        if (event.content) {
          yield { type: 'text', delta: event.content };
        }
        if (event.toolCallDeltas) {
          for (const delta of event.toolCallDeltas) {
            const current = toolAcc.get(delta.index) || { id: '', name: '', arguments: '' };
            if (delta.id) current.id = delta.id;
            if (delta.name) current.name += delta.name;
            if (delta.arguments) current.arguments += delta.arguments;
            toolAcc.set(delta.index, current);
          }
        }
        if (event.finishReason) {
          finishReason = event.finishReason;
        }
      }

      const toolCalls = [...toolAcc.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, call]) => call)
        .filter((call) => call.name);
      yield {
        type: 'finish',
        finishReason,
        toolCalls: toolCalls.length ? toolCalls : undefined,
      };
    } catch (error) {
      mapFetchError(error);
    } finally {
      clear();
    }
  }
}
