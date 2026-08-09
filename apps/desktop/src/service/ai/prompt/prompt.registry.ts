import { AiCapabilityKey } from '@true-north/enum';
import type { ProviderMessage } from '../provider/ai-provider';
import { buildGoalDecomposeMessages, GOAL_DECOMPOSE_SCHEMA_HINT } from './goal-decompose.prompt';

type PromptBuilder = (input: { contextText: string }) => {
  messages: ProviderMessage[];
  schemaHint: string;
};

const builders = new Map<string, PromptBuilder>([
  [
    AiCapabilityKey.GOAL_DECOMPOSE,
    ({ contextText }) => ({
      messages: buildGoalDecomposeMessages(contextText),
      schemaHint: GOAL_DECOMPOSE_SCHEMA_HINT,
    }),
  ],
]);

export class PromptRegistry {
  build(capabilityKey: string, input: { contextText: string }) {
    const builder = builders.get(capabilityKey);
    if (!builder) {
      throw new Error(`未注册 Prompt: ${capabilityKey}`);
    }
    return builder(input);
  }
}

export const promptRegistry = new PromptRegistry();
