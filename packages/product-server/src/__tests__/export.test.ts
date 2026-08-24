import type { ProductChangeLogEntry, ProductSpec, ResolvedProductReference } from '../types';
import { changelogJson, changelogMarkdown, coverageLabel, specificationMarkdown, statusLabel, topicJson, topicMarkdown } from '../export/format';

const domain: ProductSpec = {
  id: 'growth',
  kind: 'domain',
  title: '个人成长系统',
  positioning: '围绕目标形成闭环。',
  productStatus: 'roadmap',
  surfaceCoverage: 'complete',
  references: [{ id: 'growth.overview', title: '成长闭环', body: '从方向到行动。' }],
};

const moduleSpec: ProductSpec = {
  id: 'growth.habit',
  kind: 'module',
  title: '习惯管理',
  parentId: 'growth',
  route: '/growth/habit',
  positioning: '以目标为约束的养成中心。',
  productStatus: 'roadmap',
  surfaceCoverage: 'complete',
  references: [{ id: 'growth.habit.overview', title: '目标与价值', body: '习惯服务长期目标。' }],
};

const topic: ResolvedProductReference = {
  id: 'growth.habit.overview',
  title: '目标与价值',
  module: '习惯管理',
  breadcrumb: ['习惯管理', '目标与价值'],
  markdown: '习惯服务长期目标。',
  spec: moduleSpec,
  productStatus: 'roadmap',
  surfaceCoverage: 'complete',
};

const changes: ProductChangeLogEntry[] = [
  {
    version: 'v0.2.0',
    date: '2026-08-19',
    event: 'changed',
    summary: '调整习惯列表。',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    feature: {
      key: 'growth.habit:view:list',
      scope: 'view',
      moduleId: 'growth.habit',
      moduleTitle: '习惯管理',
      name: '习惯列表',
    },
  },
];

describe('ProductWiki export', () => {
  it('exports a topic as markdown and json', () => {
    expect(topicMarkdown(topic)).toBe('# 目标与价值\n\n习惯服务长期目标。\n');
    expect(JSON.parse(topicJson(topic))).toMatchObject({
      id: 'growth.habit.overview',
      title: '目标与价值',
      module: '习惯管理',
      breadcrumb: ['习惯管理', '目标与价值'],
      body: '习惯服务长期目标。',
    });
    expect(statusLabel('roadmap')).toBe('规划中');
    expect(coverageLabel('complete')).toBe('实现');
    expect(coverageLabel('none')).toBe('未实现');
  });

  it('exports a module with spec tables and generated child list', () => {
    const markdown = specificationMarkdown(domain, [domain, moduleSpec]);
    expect(markdown).toContain('# 个人成长系统');
    expect(markdown).toContain('- 标识：`growth`');
    expect(markdown).toContain('## 成长闭环');
    expect(markdown).toContain('## 子模块');
    expect(markdown).toContain('习惯管理（`growth.habit`）：以目标为约束的养成中心。');
  });

  it('exports a changelog version as markdown and json', () => {
    expect(changelogMarkdown('v0.2.0', changes)).toContain('| 2026-08-19 | 习惯管理 | view | 习惯列表 | 修改 |');
    expect(JSON.parse(changelogJson('v0.2.0', changes))).toEqual({ version: 'v0.2.0', changes });
  });
});
