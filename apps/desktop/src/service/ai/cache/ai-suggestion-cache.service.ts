import { createHash } from 'crypto';
import type { GoalDecomposeResponseVo } from '@true-north/vo';
import { AiSuggestionCache } from './ai-suggestion-cache.entity';
import { AiSuggestionCacheRepository } from './ai-suggestion-cache.repository';

export function fingerprintPromptContext(promptContext: string): string {
  return createHash('sha256').update(promptContext).digest('hex');
}

/** Fingerprint business context + skill pack content so skill edits bust cache. */
export function fingerprintPromptContextWithSkills(
  promptContext: string,
  skillFingerprint: string
): string {
  return createHash('sha256')
    .update(`${promptContext}\n@@skills@@\n${skillFingerprint}`)
    .digest('hex');
}

export class AiSuggestionCacheService {
  constructor(private readonly repository = new AiSuggestionCacheRepository()) {}

  async findMatching(input: {
    capabilityKey: string;
    refType: string;
    refId: string;
    contextFingerprint: string;
  }): Promise<GoalDecomposeResponseVo | null> {
    const row = await this.repository.findOneByLookup(
      input.capabilityKey,
      input.refType,
      input.refId
    );
    if (!row || row.contextFingerprint !== input.contextFingerprint) {
      return null;
    }
    try {
      const parsed = JSON.parse(row.payloadJson) as GoalDecomposeResponseVo;
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
    response: GoalDecomposeResponseVo;
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

export const aiSuggestionCacheService = new AiSuggestionCacheService();
