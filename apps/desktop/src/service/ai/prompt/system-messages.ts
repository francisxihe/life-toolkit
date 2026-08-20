import type { ProviderMessage } from '../provider/ai-provider';
import { matchSkillIds } from './skill.matcher';
import { skillRegistry } from './skill.registry';
import type { SkillId, SkillSignal } from './skill.types';

export function resolveSkillIds(signal: SkillSignal): SkillId[] {
  return matchSkillIds(signal);
}

/** Build system messages for matched skills (order preserved). */
export function buildSystemMessages(signal: SkillSignal): ProviderMessage[] {
  const ids = resolveSkillIds(signal);
  return skillRegistry.getMany(ids).map((skill) => ({
    role: 'system' as const,
    content: skill.body,
  }));
}

export function skillFingerprintFragment(skillIds: SkillId[]): string {
  return skillRegistry.contentFingerprint(skillIds);
}
