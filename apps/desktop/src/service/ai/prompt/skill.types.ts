export type SkillId = 'chat.contract' | 'growth.goal' | 'growth.task';

export type SkillDefinition = {
  id: SkillId;
  title: string;
  body: string;
};

/** Signals extracted from outbound request / message parts. */
export type SkillSignal = {
  entityLinkTypes?: Array<'goal' | 'task'>;
  workspaceKeys?: Array<'goal.decompose' | 'task.decompose'>;
  capabilityKey?: string;
};
