import { createHash } from 'crypto';
import { AiSuggestionCache } from './ai-suggestion-cache.entity';
import { CacheRepository } from './ai-suggestion-cache.repository';

export type CachedCapabilityResponse = {
  runId: string;
  analysisSummary: string;
  suggestions: unknown[];
};

export function fingerprintPromptContext(promptContext: string): string {
  return createHash('sha256').update(promptContext).digest('hex');
}

export class CacheService {
  constructor(private readonly repository = new CacheRepository()) {}

  async findMatching<T extends CachedCapabilityResponse>(input: {
    capabilityKey: string;
    refType: string;
    refId: string;
    contextFingerprint: string;
  }): Promise<T | null> {
    const row = await this.repository.findOneByLookup(
      input.capabilityKey,
      input.refType,
      input.refId
    );
    if (!row || row.contextFingerprint !== input.contextFingerprint) {
      return null;
    }
    try {
      const parsed = JSON.parse(row.payloadJson) as T;
      if (!parsed?.runId || !Array.isArray(parsed.suggestions)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async upsert(input: {
    capabilityKey: string;
    refType: string;
    refId: string;
    contextFingerprint: string;
    response: CachedCapabilityResponse;
  }): Promise<void> {
    const existing = await this.repository.findOneByLookup(
      input.capabilityKey,
      input.refType,
      input.refId
    );
    const payloadJson = JSON.stringify(input.response);

    if (existing) {
      existing.contextFingerprint = input.contextFingerprint;
      existing.runId = input.response.runId;
      existing.payloadJson = payloadJson;
      await this.repository.update(existing);
      return;
    }

    const entity = new AiSuggestionCache();
    entity.capabilityKey = input.capabilityKey;
    entity.refType = input.refType;
    entity.refId = input.refId;
    entity.contextFingerprint = input.contextFingerprint;
    entity.runId = input.response.runId;
    entity.payloadJson = payloadJson;
    await this.repository.create(entity);
  }
}

export const cacheService = new CacheService();
