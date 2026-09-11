import { Goal } from './service/goal/goal.entity';
import { Task } from './service/task/task.entity';
import { Todo } from './service/todo/todo.entity';
import { TodoRepeat } from './service/todo/todo-repeat.entity';
import { Repeat } from './service/repeat/repeat.entity';
import { Habit } from './service/habit/habit.entity';
import { TrackTime } from './service/track-time/entity';

export const growthEntities = [Goal, Task, Todo, TodoRepeat, Repeat, Habit, TrackTime];
