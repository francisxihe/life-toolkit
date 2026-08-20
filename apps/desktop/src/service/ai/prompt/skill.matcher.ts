import { AiCapabilityKey } from '@true-north/enum';
import type { AiMessagePartVo } from '@true-north/vo';
import type { SkillId, SkillSignal } from './skill.types';

function collectEntityLinkTypes(part: AiMessagePartVo): Array<'goal' | 'task'> {
  if (part.type === 'text') {
    return (part.entityLinks || []).map((link) => link.type);
  }
  if (part.type === 'workspace' && part.payload.ref?.type) {
    return [part.payload.ref.type];
  }
  return [];
}

export function collectSignalsFromParts(parts: AiMessagePartVo[] | undefined): {
  entityLinkTypes: Array<'goal' | 'task'>;
  workspaceKeys: Array<'goal.decompose' | 'task.decompose'>;
} {
  const entityLinkTypes = new Set<'goal' | 'task'>();
  const workspaceKeys = new Set<'goal.decompose' | 'task.decompose'>();
  for (const part of parts || []) {
    for (const type of collectEntityLinkTypes(part)) {
      entityLinkTypes.add(type);
    }
    if (part.type === 'workspace') {
      if (part.workspaceKey === 'goal.decompose' || part.workspaceKey === 'task.decompose') {
        workspaceKeys.add(part.workspaceKey);
      }
    }
  }
  return {
    entityLinkTypes: [...entityLinkTypes],
    workspaceKeys: [...workspaceKeys],
  };
}

export function collectSignalsFromMessages(
  messages: Array<{ parts?: AiMessagePartVo[] }>
): ReturnType<typeof collectSignalsFromParts> {
  const entityLinkTypes = new Set<'goal' | 'task'>();
  const workspaceKeys = new Set<'goal.decompose' | 'task.decompose'>();
  for (const message of messages) {
    const collected = collectSignalsFromParts(message.parts);
    for (const type of collected.entityLinkTypes) entityLinkTypes.add(type);
    for (const key of collected.workspaceKeys) workspaceKeys.add(key);
  }
  return {
    entityLinkTypes: [...entityLinkTypes],
    workspaceKeys: [...workspaceKeys],
  };
}

/**
 * Resolve skill ids from outbound request signals.
 * - Chat: always includes chat.contract; domain skills from message parts.
 * - Capability: domain skill from capability key only (no chat.contract).
 */
export function matchSkillIds(signal: SkillSignal): SkillId[] {
  const ids: SkillId[] = [];

  if (!signal.capabilityKey) {
    ids.push('chat.contract');
  }

  const hasPartGoal =
    signal.entityLinkTypes?.includes('goal') ||
    signal.workspaceKeys?.includes('goal.decompose');
  const hasPartTask =
    signal.entityLinkTypes?.includes('task') ||
    signal.workspaceKeys?.includes('task.decompose');

  if (signal.capabilityKey === AiCapabilityKey.GOAL_DECOMPOSE || hasPartGoal) {
    ids.push('growth.goal');
  }
  if (signal.capabilityKey === AiCapabilityKey.TASK_DECOMPOSE || hasPartTask) {
    ids.push('growth.task');
  }

  return [...new Set(ids)];
}
