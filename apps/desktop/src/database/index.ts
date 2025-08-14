export { BaseService } from './base.service';
export { UserService, userService } from './users/user.service';
export { GoalService, goalService } from './growth/goal/goal.service';
export { TaskService, taskService } from './growth/task/task.service';
export { TodoService, todoService } from './growth/todo/todo.service';
export { HabitService, habitService } from './growth/habit/habit.service';

// 导入服务实例
import { userService } from './users/user.service';
import { goalService } from './growth/goal/goal.service';
import { taskService } from './growth/task/task.service';
import { todoService } from './growth/todo/todo.service';
import { habitService } from './growth/habit/habit.service';

// 导出所有服务实例
export const services = {
  user: userService,
  goal: goalService,
  task: taskService,
  todo: todoService,
  habit: habitService,
};