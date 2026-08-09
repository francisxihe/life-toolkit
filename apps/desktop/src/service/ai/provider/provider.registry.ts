import { AiProviderKind } from '@true-north/enum';
import { AiPlatformError } from '../ai-error';
import type { AiProvider } from './ai-provider';
import { OpenAICompatibleProvider } from './openai-compatible.provider';

const providers = new Map<AiProviderKind, AiProvider>([
  [AiProviderKind.OPENAI_COMPATIBLE, new OpenAICompatibleProvider()],
]);

export class AiProviderRegistry {
  get(kind: AiProviderKind): AiProvider {
    const provider = providers.get(kind);
    if (!provider) {
      throw AiPlatformError.notConfigured(`不支持的 Provider: ${kind}`);
    }
    return provider;
  }
}

export const aiProviderRegistry = new AiProviderRegistry();
