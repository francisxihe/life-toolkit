import { PLUGIN_API_VERSION, type PluginManifest } from '@true-north/plugin-sdk';
import { version } from '../package.json';
import { GoalDecomposeKey, TaskDecomposeKey } from './contract/index';

export const growthManifest: PluginManifest = {
  pluginId: 'growth',
  apiVersion: PLUGIN_API_VERSION,
  version,
  contributions: {
    ipc: [
      { id: 'goal', routePrefix: '/goal' },
      { id: 'task', routePrefix: '/task' },
      { id: 'todo', routePrefix: '/todo' },
      { id: 'habit', routePrefix: '/habit' },
      { id: 'track-time', routePrefix: '/track-time' },
    ],
    ai: {
      capabilityKeys: [GoalDecomposeKey, TaskDecomposeKey],
      toolNames: ['search_goals', 'search_tasks', 'get_goal', 'get_task', 'decompose_goal', 'decompose_task'],
      entityTypes: ['goal', 'task'],
    },
    workbench: { workspaceKeys: [GoalDecomposeKey, TaskDecomposeKey] },
    activity: {
      captureTypes: ['growth.todo'],
      entityTypes: ['goal', 'task', 'todo', 'habit', 'track-time'],
      today: true,
    },
    storage: {
      entityTypes: ['goal', 'task', 'todo', 'todo-repeat', 'repeat', 'habit', 'track-time'],
    },
  },
};

export default growthManifest;
