import { registerIpcHandlers } from 'electron-ipc-restful';
import { installLabIpc, installRestHook } from './dev-trace';
import { AiController } from '../service/ai/ai.route-controller';
import { GoalController } from '../service/growth/goal/goal.route-controller';
import { HabitController } from '../service/growth/habit/habit.route-controller';
import { TaskController } from '../service/growth/task/task.route-controller';
import { TodoController } from '../service/growth/todo/todo.route-controller';
import { TrackTimeController } from '../service/growth/track-time/track-time.route-controller';
import { BrowserController } from '../service/browser';

/**
 * 初始化所有 IPC 处理器
 * route-controller 同时承担 VO 边界与 electron-ipc-restful 路由注册
 */
export function initIpcRouter(): void {
  installRestHook();
  installLabIpc();
  registerIpcHandlers({
    controllers: [
      GoalController,
      HabitController,
      TaskController,
      TodoController,
      TrackTimeController,
      AiController,
      BrowserController,
    ],
  });
}
