import type { ProductChangeLog, ProductSpec } from '../types';
import { featureKey, getProductVersionChanges, getProductVersions, latestProductChange, listActiveProductFeatures } from '../version-history';

const moduleKey = featureKey('growth.todo', 'module', 'growth.todo');
const fieldKey = featureKey('growth.todo', 'field', 'todo.title');

const history: ProductChangeLog = {
  changes: [
    {
      version: 'v0.2.0', date: '2026-07-29', event: 'changed', summary: '调整待办模块。', productStatus: 'roadmap', prototypeCoverage: 'complete',
      feature: { key: moduleKey, scope: 'module', moduleId: 'growth.todo', moduleTitle: '待办管理', name: '待办管理' },
    },
    {
      version: 'v0.10.0', date: '2026-07-29', event: 'changed', summary: '再次调整待办模块。', productStatus: 'roadmap', prototypeCoverage: 'complete',
      feature: { key: moduleKey, scope: 'module', moduleId: 'growth.todo', moduleTitle: '待办管理', name: '待办管理' },
    },
    {
      version: 'v0.1.0', date: '2026-07-28', event: 'baseline', summary: '建立标题字段。', productStatus: 'roadmap', prototypeCoverage: 'complete',
      feature: { key: fieldKey, scope: 'field', moduleId: 'growth.todo', moduleTitle: '待办管理', name: '标题', parentName: '待办' },
    },
    {
      version: 'v0.1.0', date: '2026-07-30', event: 'removed', summary: '移除旧标题字段。', productStatus: 'deprecated', prototypeCoverage: 'none',
      feature: { key: fieldKey, scope: 'field', moduleId: 'growth.todo', moduleTitle: '待办管理', name: '标题', parentName: '待办' },
    },
  ],
};

describe('ProductWiki version history', () => {
  it('allows an empty history when desktop baseline capabilities are not versioned here', () => {
    expect(getProductVersions({ changes: [] })).toEqual([]);
    expect(getProductVersionChanges({ changes: [] }, 'v0.1.0')).toEqual([]);
  });

  it('sorts distinct versions semantically and keeps every matching record', () => {
    expect(getProductVersions(history)).toEqual(['v0.10.0', 'v0.2.0', 'v0.1.0']);
    expect(getProductVersionChanges(history, 'v0.1.0')).toHaveLength(2);
  });

  it('finds the latest record with semantic version precedence on the same date', () => {
    expect(latestProductChange(history, [moduleKey])?.summary).toBe('再次调整待办模块。');
  });

  it('keeps a removed feature queryable from its own historical snapshot', () => {
    const removed = getProductVersionChanges(history, 'v0.1.0').find((change) => change.event === 'removed');
    expect(removed?.feature).toEqual({
      key: fieldKey,
      scope: 'field',
      moduleId: 'growth.todo',
      moduleTitle: '待办管理',
      name: '标题',
      parentName: '待办',
    });
  });

  it('derives stable keys for current module, entity, field, view, and rule features', () => {
    const specification = {
      id: 'growth.todo', kind: 'module', title: '待办管理', document: 'growth/todo/README.md', productStatus: 'roadmap', prototypeCoverage: 'complete', references: [],
      entities: [{ id: 'todo', name: '待办', productStatus: 'roadmap', prototypeCoverage: 'complete', fields: [{ id: 'title', name: '标题', type: 'string', required: true, description: '待办标题。', productStatus: 'roadmap', prototypeCoverage: 'complete' }] }],
      views: [{ id: 'today', name: '今日待办', prototypePage: '/todo', scenario: '查看今日事项。', productStatus: 'roadmap', prototypeCoverage: 'complete', reference: 'growth.todo.view.today' }],
      rules: [{ id: 'related', name: '关联约束', entities: ['todo'], description: '维护关联。', reference: 'growth.todo.rule.related', productStatus: 'roadmap', prototypeCoverage: 'complete' }],
    } satisfies ProductSpec;
    expect(listActiveProductFeatures([specification]).map((feature) => feature.key)).toEqual([
      featureKey('growth.todo', 'module', 'growth.todo'),
      featureKey('growth.todo', 'entity', 'todo'),
      featureKey('growth.todo', 'field', 'todo.title'),
      featureKey('growth.todo', 'view', 'today'),
      featureKey('growth.todo', 'rule', 'related'),
    ]);
  });
});
