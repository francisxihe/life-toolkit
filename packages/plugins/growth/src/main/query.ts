import { createRepositoryQueryPort, type HostStorageRuntime } from '@true-north/plugin-sdk/main';
import type { PluginQueryPort } from '@true-north/plugin-sdk';
import { Goal } from './service/goal/goal.entity';
import { Task } from './service/task/task.entity';
import { Todo } from './service/todo/todo.entity';
import { TodoRepeat } from './service/todo/todo-repeat.entity';
import { Repeat } from './service/repeat/repeat.entity';
import { Habit } from './service/habit/habit.entity';
import { TrackTime } from './service/track-time/entity';
import { PLUGIN_ID } from './storage';

export function createGrowthQuery(runtime: HostStorageRuntime): PluginQueryPort {
  return createRepositoryQueryPort(PLUGIN_ID, runtime, [
    { entityType: 'goal', entity: Goal, label: (row) => String(row.name || '') },
    { entityType: 'task', entity: Task, label: (row) => String(row.name || '') },
    { entityType: 'todo', entity: Todo, label: (row) => String(row.name || '') },
    { entityType: 'todo-repeat', entity: TodoRepeat, label: (row) => String(row.name || row.id) },
    { entityType: 'repeat', entity: Repeat, label: (row) => String(row.id) },
    { entityType: 'habit', entity: Habit, label: (row) => String(row.name || '') },
    { entityType: 'track-time', entity: TrackTime, label: (row) => String(row.notes || row.id) },
  ]);
}
