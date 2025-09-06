import { ipcMain } from "electron";
import type {
  RouteDef,
  RestHandlerCtx,
} from "electron-ipc-restful";
import {
  TodoStatus,
  TodoSource,
  HabitStatus,
  Difficulty,
  TaskStatus,
  GoalType,
  GoalStatus,
} from "@life-toolkit/enum";

/**
 * 注册枚举类型相关的 IPC 处理器
 */
export function registerEnumsIpcHandlers(): void {
  // 枚举类型导出（供前端使用）
  ipcMain.handle("enums:getGoalTypes", () => {
    return Object.values(GoalType);
  });

  ipcMain.handle("enums:getGoalStatuses", () => {
    return Object.values(GoalStatus);
  });

  ipcMain.handle("enums:getTaskStatuses", () => {
    return Object.values(TaskStatus);
  });

  ipcMain.handle("enums:getTodoStatuses", () => {
    return Object.values(TodoStatus);
  });

  ipcMain.handle("enums:getTodoSources", () => {
    return Object.values(TodoSource);
  });

  ipcMain.handle("enums:getHabitStatuses", () => {
    return Object.values(HabitStatus);
  });

  ipcMain.handle("enums:getHabitDifficulties", () => {
    return Object.values(Difficulty);
  });
}

// REST 路由表（与现有 IPC 路由等价）
export const enumRestRoutes: RouteDef[] = [
  {
    method: "GET",
    path: "/enums/getGoalTypes",
    handler: (_: RestHandlerCtx) => Object.values(GoalType),
  },
  {
    method: "GET",
    path: "/enums/getGoalStatuses",
    handler: (_: RestHandlerCtx) => Object.values(GoalStatus),
  },
  {
    method: "GET",
    path: "/enums/getTaskStatuses",
    handler: (_: RestHandlerCtx) => Object.values(TaskStatus),
  },
  {
    method: "GET",
    path: "/enums/getTodoStatuses",
    handler: (_: RestHandlerCtx) => Object.values(TodoStatus),
  },
  {
    method: "GET",
    path: "/enums/getTodoSources",
    handler: (_: RestHandlerCtx) => Object.values(TodoSource),
  },
  {
    method: "GET",
    path: "/enums/getHabitStatuses",
    handler: (_: RestHandlerCtx) => Object.values(HabitStatus),
  },
  {
    method: "GET",
    path: "/enums/getHabitDifficulties",
    handler: (_: RestHandlerCtx) => Object.values(Difficulty),
  },
];
