import { PLUGIN_API_VERSION, definePluginManifest } from '@true-north/plugin-contract';
import { version } from '../package.json';
import { GoalDecomposeKey, TaskDecomposeKey } from './contract/index';

export const growthManifest = definePluginManifest({
  pluginId: 'growth',
  apiVersion: PLUGIN_API_VERSION,
  version,
  catalog: {
    nameKey: 'menu.growth',
    descriptionKey: 'growth.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['todo', 'task', 'habit', 'goal', '待办', '任务', '习惯', '目标'],
    order: 10,
  },
  hostCapabilities: ['activity', 'ai', 'storage', 'workbench', 'ipc'],
  contributions: {
    ipc: {
      goal: { routePrefix: '/goal' },
      task: { routePrefix: '/task' },
      todo: { routePrefix: '/todo' },
      habit: { routePrefix: '/habit' },
      'track-time': { routePrefix: '/trackTime' },
    },
    ai: {
      capabilities: {
        'goal-decompose': { key: GoalDecomposeKey },
        'task-decompose': { key: TaskDecomposeKey },
      },
      tools: {
        search_goals: { name: 'search_goals' },
        search_tasks: { name: 'search_tasks' },
        get_goal: { name: 'get_goal' },
        get_task: { name: 'get_task' },
        decompose_goal: { name: 'decompose_goal' },
        decompose_task: { name: 'decompose_task' },
      },
      entityTypes: ['goal', 'task'],
    },
    workbench: {
      workspaces: {
        'goal-decompose': { key: GoalDecomposeKey },
        'task-decompose': { key: TaskDecomposeKey },
      },
    },
    activity: {
      captureTypes: { todo: { type: 'growth.todo' } },
      entityTypes: ['goal', 'task', 'todo', 'habit', 'track-time'],
      today: {
        'focus-timer': { kind: 'timer', titleKey: 'today.focus', order: 5 },
        focus: { kind: 'metric', titleKey: 'today.focus', order: 10, unit: 'seconds' },
        todos: { kind: 'list', titleKey: 'menu.todo', order: 20 },
        habits: { kind: 'list', titleKey: 'menu.habit', order: 30 },
      },
    },
    storage: {
      capability: 'self-managed',
      entityTypes: ['goal', 'task', 'todo', 'todo-repeat', 'repeat', 'habit', 'track-time'],
    },
    shell: {
      slots: {
        'focus-timer': { slot: 'app-providers', order: 30 },
        'task-drawer': { slot: 'page-overlay', order: 10 },
        'focus-action': { slot: 'aside-actions', order: 10 },
      },
    },
  },
});

export default growthManifest;
