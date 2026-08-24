import type { ProductChangeLog, ProductSpec } from '../types';
import { collectProductRefsForRoute, matchDesktopRoute } from '../route-refs';
import { productBreadcrumb, resolveProductReferenceFromSpecs } from '../resolve-reference';

const specs = [
  {
    id: 'growth.todo',
    kind: 'module',
    title: '待办管理',
    route: '/growth/todo',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    views: [
      {
        id: 'today',
        name: '当前待办',
        desktopRoute: '/growth/todo/todo-today',
        scenario: '今天',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.todo.view.today',
      },
      {
        id: 'week',
        name: '本周待办',
        desktopRoute: '/growth/todo/todo-today',
        scenario: '本周',
        productStatus: 'deprecated',
        surfaceCoverage: 'none',
        reference: 'growth.todo.view.week',
      },
      {
        id: 'calendar',
        name: '待办日历',
        desktopRoute: '/growth/todo/todo-calendar',
        scenario: '日历',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.todo.view.calendar',
      },
    ],
    references: [
      { id: 'growth.todo.overview' as const, title: '目标与价值', body: '待办承载当天行动。' },
      { id: 'growth.todo.view.today' as const, title: '当前待办', body: '按日期查看待办。' },
    ],
  },
  {
    id: 'growth.habit',
    kind: 'module',
    title: '习惯',
    parentId: 'growth',
    route: '/growth/habit',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    views: [
      {
        id: 'detail',
        name: '习惯详情',
        desktopRoute: '/growth/habit/habit-detail/:id',
        scenario: '详情',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.habit.view.detail',
      },
    ],
    references: [{ id: 'growth.habit.overview' as const, title: '目标与价值', body: '习惯服务长期目标。' }],
  },
  {
    id: 'growth.goal',
    kind: 'module',
    title: '目标',
    route: '/growth/goal',
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
        id: 'ai',
        name: 'AI 拆解',
        desktopRoute: '/ai',
        scenario: '拆解',
        productStatus: 'roadmap',
        surfaceCoverage: 'complete',
        reference: 'growth.goal.view.ai-decomposition',
      },
    ],
    references: [{ id: 'growth.goal.overview' as const, title: '目标与价值', body: '目标表达长期方向。' }],
  },
  {
    id: 'growth',
    kind: 'domain',
    title: '个人成长系统',
    positioning: '围绕目标形成闭环。',
    productStatus: 'roadmap',
    surfaceCoverage: 'complete',
    references: [{ id: 'growth.overview' as const, title: '成长闭环', body: '从方向到行动。' }],
  },
] as unknown as ProductSpec[];

const history: ProductChangeLog = { changes: [] };

describe('matchDesktopRoute', () => {
  it('matches an exact path', () => {
    expect(matchDesktopRoute('/growth/todo/todo-calendar', '/growth/todo/todo-calendar')).toBe(true);
    expect(matchDesktopRoute('/growth/todo/todo-calendar', '/growth/todo/todo-today')).toBe(false);
  });

  it('matches a :param segment', () => {
    expect(matchDesktopRoute('/growth/habit/habit-detail/:id', '/growth/habit/habit-detail/abc')).toBe(true);
    expect(matchDesktopRoute('/growth/habit/habit-detail/:id', '/growth/habit/habit-detail')).toBe(false);
    expect(matchDesktopRoute('/growth/habit/habit-detail/:id', '/growth/habit/habit-list')).toBe(false);
  });
});

describe('collectProductRefsForRoute', () => {
  it('returns the view for an exact desktopRoute and skips deprecated views', () => {
    expect(collectProductRefsForRoute(specs, '/growth/todo/todo-today')).toEqual(['growth.todo.view.today']);
    expect(collectProductRefsForRoute(specs, '/growth/todo/todo-calendar')).toEqual(['growth.todo.view.calendar']);
  });

  it('matches parameterized desktopRoute', () => {
    expect(collectProductRefsForRoute(specs, '/growth/habit/habit-detail/42')).toEqual(['growth.habit.view.detail']);
  });

  it('intersects matching views with visible DOM refs', () => {
    expect(
      collectProductRefsForRoute(specs, '/growth/goal', ['growth.goal.view.detail', 'growth.goal.rule.type']),
    ).toEqual(['growth.goal.view.detail']);
  });

  it('keeps spec-matched views when visible refs do not intersect', () => {
    expect(collectProductRefsForRoute(specs, '/growth/goal', ['global.overview'])).toEqual([
      'growth.goal.view.tree',
      'growth.goal.view.detail',
    ]);
  });

  it('falls back to the longest spec.route prefix overview', () => {
    expect(collectProductRefsForRoute(specs, '/growth/todo/unknown')).toEqual(['growth.todo.overview']);
  });

  it('returns nothing when no view or module route matches', () => {
    expect(collectProductRefsForRoute(specs, '/expenses/ledger')).toEqual([]);
  });
});

describe('resolveProductReferenceFromSpecs', () => {
  it('reads title and body from spec.json references', () => {
    const topic = resolveProductReferenceFromSpecs(specs, history, 'growth.todo.view.today');
    expect(topic).toMatchObject({
      id: 'growth.todo.view.today',
      title: '当前待办',
      module: '待办管理',
      breadcrumb: ['待办管理', '当前待办'],
      markdown: '按日期查看待办。',
      productStatus: 'roadmap',
      surfaceCoverage: 'complete',
    });
  });

  it('names module documentation as module / title', () => {
    expect(productBreadcrumb(specs[0], 'growth.todo.overview')).toEqual(['待办管理', '目标与价值']);
  });

  it('names a field as module / entity / field', () => {
    const spec: ProductSpec = {
      id: 'growth.task',
      kind: 'module',
      title: '任务管理',
      productStatus: 'roadmap',
      surfaceCoverage: 'complete',
      entities: [
        {
          id: 'task',
          name: '任务',
          productStatus: 'roadmap',
          surfaceCoverage: 'complete',
          fields: [
            {
              id: 'estimated',
              name: '预计耗时',
              type: 'number',
              required: true,
              description: '用于排程和时间对比。',
              productStatus: 'roadmap',
              surfaceCoverage: 'complete',
            },
          ],
        },
      ],
      references: [{ id: 'growth.task.overview', title: '目标与价值', body: '' }],
    };
    expect(productBreadcrumb(spec, 'growth.task.task.estimated')).toEqual(['任务管理', '任务', '预计耗时']);
  });
});
