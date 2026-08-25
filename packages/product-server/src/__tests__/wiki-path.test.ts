import type { ProductSpec } from '../types';
import { specNavViews, wikiBreadcrumbPath, wikiPathNavigateRef } from '../wiki-path';

const wikiSpecs = [
  {
    id: 'global',
    kind: 'global',
    title: 'True North ProductWiki',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    references: [{ id: 'global.overview', title: '全局', body: '套件规范。' }],
  },
  {
    id: 'growth',
    kind: 'domain',
    title: '个人成长系统',
    parentId: 'global',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    references: [{ id: 'growth.overview', title: '成长闭环', body: '从方向到行动。' }],
  },
  {
    id: 'ai',
    kind: 'domain',
    title: 'AI',
    parentId: 'global',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    references: [{ id: 'ai.overview', title: 'AI 能力', body: '会话与拆解。' }],
  },
  {
    id: 'growth.goal',
    kind: 'module',
    title: '目标管理',
    parentId: 'growth',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    views: [
      {
        id: 'tree',
        name: '目标树',
        desktopRoute: '/growth/goal',
        scenario: '树',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.goal.view.tree',
      },
      {
        id: 'detail',
        name: '目标详情',
        desktopRoute: '/growth/goal',
        scenario: '详情',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.goal.view.detail',
      },
      {
        id: 'week',
        name: '本周目标',
        desktopRoute: '/growth/goal',
        scenario: '周',
        productStatus: 'deprecated',
        surfaceCoverage: 'none',
        reference: 'growth.goal.view.week',
      },
    ],
    references: [
      { id: 'growth.goal.overview', title: '目标与价值', body: '目标表达长期方向。' },
      { id: 'growth.goal.view.tree', title: '目标树', body: '浏览目标层级。' },
      { id: 'growth.goal.view.detail', title: '目标详情', body: '查看单个目标。' },
    ],
  },
  {
    id: 'growth.task',
    kind: 'module',
    title: '任务管理',
    parentId: 'growth',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    references: [{ id: 'growth.task.overview', title: '目标与价值', body: '任务承接目标。' }],
  },
] as unknown as ProductSpec[];

const goal = wikiSpecs.find((spec) => spec.id === 'growth.goal')!;

describe('wikiBreadcrumbPath', () => {
  it('walks growth → goal → document and omits global', () => {
    const path = wikiBreadcrumbPath(wikiSpecs, goal, 'growth.goal.view.tree');
    expect(path.map((level) => ({ kind: level.kind, title: level.title, currentId: level.currentId }))).toEqual([
      { kind: 'spec', title: '个人成长系统', currentId: 'growth' },
      { kind: 'spec', title: '目标管理', currentId: 'growth.goal' },
      { kind: 'reference', title: '目标树', currentId: 'growth.goal.view.tree' },
    ]);
  });

  it('lists child modules at the growth level, not sibling domains', () => {
    const path = wikiBreadcrumbPath(wikiSpecs, goal, 'growth.goal.view.tree');
    const growthLevel = path.find((level) => level.currentId === 'growth');
    expect(growthLevel?.siblings.map((item) => item.id).sort()).toEqual(['growth.goal', 'growth.task']);
    expect(growthLevel?.siblings.every((item) => item.kind === 'spec')).toBe(true);
  });

  it('lists views at a non-leaf module level and skips deprecated views', () => {
    const path = wikiBreadcrumbPath(wikiSpecs, goal, 'growth.goal.view.tree');
    const goalLevel = path.find((level) => level.currentId === 'growth.goal');
    expect(goalLevel?.siblings.map((item) => item.id)).toEqual([
      'growth.goal.view.tree',
      'growth.goal.view.detail',
    ]);
    expect(goalLevel?.siblings.every((item) => item.kind === 'view')).toBe(true);
  });

  it('gives the leaf crumb no dropdown items', () => {
    const path = wikiBreadcrumbPath(wikiSpecs, goal, 'growth.goal.view.tree');
    expect(path[path.length - 1].siblings).toEqual([]);
  });

  it('truncates to the spec chain when focus is spec and clears the leaf dropdown', () => {
    const path = wikiBreadcrumbPath(wikiSpecs, goal, 'growth.goal.view.tree', 'spec');
    expect(path.map((level) => ({ kind: level.kind, title: level.title, currentId: level.currentId }))).toEqual([
      { kind: 'spec', title: '个人成长系统', currentId: 'growth' },
      { kind: 'spec', title: '目标管理', currentId: 'growth.goal' },
    ]);
    expect(path[path.length - 1].siblings).toEqual([]);
  });
});

describe('wikiPathNavigateRef', () => {
  const specsById = new Map(wikiSpecs.map((spec) => [spec.id, spec]));

  it('navigates a child spec menu item to its overview', () => {
    const path = wikiBreadcrumbPath(wikiSpecs, goal, 'growth.goal.view.tree');
    const growthLevel = path.find((level) => level.currentId === 'growth')!;
    expect(wikiPathNavigateRef(wikiSpecs, specsById, growthLevel, 'growth.task')).toBe('growth.task.overview');
  });

  it('navigates a view menu item to that reference', () => {
    const path = wikiBreadcrumbPath(wikiSpecs, goal, 'growth.goal.view.tree');
    const goalLevel = path.find((level) => level.currentId === 'growth.goal')!;
    expect(wikiPathNavigateRef(wikiSpecs, specsById, goalLevel, 'growth.goal.view.detail')).toBe(
      'growth.goal.view.detail',
    );
  });
});

describe('specNavViews', () => {
  const task: ProductSpec = {
    id: 'growth.task',
    kind: 'module',
    title: '任务管理',
    parentId: 'growth',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    views: [
      {
        id: 'today',
        name: '当前任务',
        desktopRoute: '/growth/task/task-today',
        scenario: '今天',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.task.view.today',
      },
      {
        id: 'week',
        name: '本周任务',
        desktopRoute: '/growth/task/task-today',
        scenario: '本周',
        productStatus: 'deprecated',
        surfaceCoverage: 'none',
        reference: 'growth.task.view.week',
      },
      {
        id: 'all',
        name: '全部任务',
        desktopRoute: '/growth/task/task-all',
        scenario: '全部',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.task.view.all',
      },
      {
        id: 'statistics',
        name: '任务统计',
        desktopRoute: '/growth/task/task-today',
        scenario: '统计',
        productStatus: 'deprecated',
        surfaceCoverage: 'none',
        reference: 'growth.task.view.statistics',
      },
      {
        id: 'calendar',
        name: '月度排程',
        desktopRoute: '/growth/task/task-calendar',
        scenario: '日历',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.task.view.calendar',
      },
    ],
    references: [{ id: 'growth.task.overview', title: '目标与价值', body: '任务承接目标。' }],
  };

  it('keeps non-deprecated views in spec order', () => {
    expect(specNavViews(task).map((view) => view.id)).toEqual(['today', 'all', 'calendar']);
  });

  it('returns an empty list when the spec has no views', () => {
    expect(specNavViews(wikiSpecs.find((spec) => spec.id === 'growth')!)).toEqual([]);
  });
});
