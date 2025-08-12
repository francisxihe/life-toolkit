// 导入 VO 类型
import {
  BaseModelVo,
  GoalVo,
  GoalItemVo,
  GoalModelVo,
  GoalStatus,
  GoalType,
  TaskVo,
  TaskItemVo,
  TaskModelVo,
  TaskStatus,
  TodoVo,
  TodoItemVo,
  TodoModelVo,
  TodoStatus,
  HabitVo,
  HabitItemVo,
  HabitModelVo,
  HabitStatus,
  HabitDifficulty
} from '@life-toolkit/vo';

// 用户相关类型（暂时保持原有定义，因为vo中没有用户类型）
export interface User {
  id: string;
  username: string;
  password: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  name?: string;
}

// 导出 VO 类型
export type { 
  BaseModelVo,
  GoalVo,
  GoalItemVo,
  GoalModelVo,
  TaskVo,
  TaskItemVo,
  TaskModelVo,
  TodoVo,
  TodoItemVo,
  TodoModelVo,
  HabitVo,
  HabitItemVo,
  HabitModelVo
};

// 导出枚举
export {
  GoalStatus,
  GoalType,
  TaskStatus,
  TodoStatus,
  HabitStatus,
  HabitDifficulty
};

// 创建数据类型（基于VO类型）
export interface CreateGoalData {
  name: string;
  description?: string;
  type?: GoalType;
  importance?: number;
  startAt?: string;
  endAt?: string;
  tags?: string[];
}

export interface CreateTaskData {
  name: string;
  description?: string;
  importance?: number;
  urgency?: number;
  tags?: string[];
  startAt?: string;
  endAt?: string;
  goalId?: string;
  parentId?: string;
}

export interface CreateTodoData {
  name: string;
  description?: string;
  importance?: number;
  urgency?: number;
  tags?: string[];
  planStartAt?: string;
  planEndAt?: string;
  planDate: string;
}

export interface CreateHabitData {
  name: string;
  description?: string;
  importance?: number;
  tags?: string[];
  difficulty?: HabitDifficulty;
  startAt?: string;
  targetAt?: string;
}