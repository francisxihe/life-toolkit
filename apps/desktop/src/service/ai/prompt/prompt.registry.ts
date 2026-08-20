import { AiCapabilityKey } from '@true-north/enum';
import type { ProviderMessage } from '../provider/ai-provider';
import { buildGoalDecomposeMessages, GOAL_DECOMPOSE_SCHEMA_HINT } from './goal-decompose.prompt';
import { buildTaskDecomposeMessages, TASK_DECOMPOSE_SCHEMA_HINT } from './task-decompose.prompt';
import { buildSystemMessages, resolveSkillIds, skillFingerprintFragment } from './system-messages';

type PromptBuilder = (input: { contextText: string }) => {
  messages: ProviderMessage[];
  schemaHint: string;
  skillIds: string[];
  skillFingerprint: string;
};

function withCapabilitySkills(
  capabilityKey: string,
  capabilityMessages: ProviderMessage[],
  schemaHint: string
): ReturnType<PromptBuilder> {
  const skillIds = resolveSkillIds({ capabilityKey });
  const skillMessages = buildSystemMessages({ capabilityKey });
  // Domain skills first; capability JSON contract must be the last system message.
  const systems = [
    ...skillMessages,
    ...capabilityMessages.filter((item) => item.role === 'system'),
  ];
  const nonSystems = capabilityMessages.filter((item) => item.role !== 'system');
  return {
    messages: [...systems, ...nonSystems],
    schemaHint,
    skillIds,
    skillFingerprint: skillFingerprintFragment(skillIds),
  };
}

const builders = new Map<string, PromptBuilder>([
  [
    AiCapabilityKey.GOAL_DECOMPOSE,
    ({ contextText }) =>
      withCapabilitySkills(
        AiCapabilityKey.GOAL_DECOMPOSE,
        buildGoalDecomposeMessages(contextText),
        GOAL_DECOMPOSE_SCHEMA_HINT
      ),
  ],
  [
    AiCapabilityKey.TASK_DECOMPOSE,
    ({ contextText }) =>
      withCapabilitySkills(
        AiCapabilityKey.TASK_DECOMPOSE,
        buildTaskDecomposeMessages(contextText),
        TASK_DECOMPOSE_SCHEMA_HINT
      ),
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
