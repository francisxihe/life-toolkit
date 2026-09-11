import { bindAiCache, bindAiCapabilityLookup } from '@true-north/plugin-sdk';
import { capabilityRegistry } from './capability/capability.registry';
import { cacheService, fingerprintPromptContext } from './cache/ai-suggestion-cache.service';

export function initializeAiRuntime() {
  bindAiCapabilityLookup({
    get: (key) => capabilityRegistry.get(key),
  });
  bindAiCache({
    fingerprintPromptContext,
    findMatching: (input) => cacheService.findMatching(input),
    upsert: (input) => cacheService.upsert(input),
  });
}
