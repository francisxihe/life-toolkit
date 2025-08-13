export { BaseService } from './base.service';
export { UserService, userService } from './user.service';
export { GoalService, goalService } from './goal.service';
export { TaskService, taskService } from './task.service';
export { TodoService, todoService } from './todo.service';
export { HabitService, habitService } from './habit.service';

// 导入服务实例
import { userService } from './user.service';
import { goalService } from './goal.service';
import { taskService } from './task.service';
import { todoService } from './todo.service';
import { habitService } from './habit.service';

// 导出所有服务实例
export const services = {
  user: userService,
  goal: goalService,
  task: taskService,
  todo: todoService,
  habit: habitService,
};