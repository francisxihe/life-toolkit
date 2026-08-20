import chatContractRaw from './skills/chat.contract.md?raw';
import growthGoalRaw from './skills/growth.goal.md?raw';
import growthTaskRaw from './skills/growth.task.md?raw';
import type { SkillDefinition, SkillId } from './skill.types';

function parseSkillMarkdown(raw: string): SkillDefinition {
  const trimmed = raw.replace(/^\uFEFF/, '');
  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Skill markdown 缺少 frontmatter');
  }
  const frontmatter = match[1];
  const body = match[2].trim();
  const idLine = frontmatter.match(/^id:\s*(.+)$/m);
  const titleLine = frontmatter.match(/^title:\s*(.+)$/m);
  const id = (idLine?.[1] || '').trim() as SkillId;
  const title = (titleLine?.[1] || id).trim();
  if (!id || !body) {
    throw new Error(`Skill 解析失败: id=${id}`);
  }
  return { id, title, body };
}

const skillList: SkillDefinition[] = [
  parseSkillMarkdown(chatContractRaw),
  parseSkillMarkdown(growthGoalRaw),
  parseSkillMarkdown(growthTaskRaw),
];

const skillById = new Map<SkillId, SkillDefinition>(
  skillList.map((skill) => [skill.id, skill])
);

export class SkillRegistry {
  get(id: SkillId): SkillDefinition {
    const skill = skillById.get(id);
    if (!skill) {
      throw new Error(`未注册 Skill: ${id}`);
    }
    return skill;
  }

  getMany(ids: SkillId[]): SkillDefinition[] {
    return ids.map((id) => this.get(id));
  }

  /** Content fingerprint fragment so cache invalidates when skill text changes. */
  contentFingerprint(ids: SkillId[]): string {
    return this.getMany(ids)
      .map((skill) => `${skill.id}\n${skill.body}`)
      .join('\n---\n');
  }
}

export const skillRegistry = new SkillRegistry();
