import dayjs from 'dayjs';
import { HabitStatus, TodoStatus } from '@true-north/enum';
import type { PluginMainContribution, PluginMainContext, TodayContribution } from '@true-north/plugin-sdk';
import { GoalController } from './service/goal/goal.route-controller';
import { HabitController } from './service/habit/habit.route-controller';
import { TaskController } from './service/task/task.route-controller';
import { TodoController } from './service/todo/todo.route-controller';
import { TrackTimeController } from './service/track-time/track-time.route-controller';
import { growthAiContribution } from './service/ai';
import { todoCaptureAdopter } from './service/todo/capture.adopter';
import { TodoFilterDto } from './service/todo/dto';
import { TodoRepository } from './service/todo/todo.repository';
import { HabitFilterDto } from './service/habit/dto';
import { HabitRepository } from './service/habit/habit.repository';
import { TrackTime } from './service/track-time/entity';
import { bindActivityPort } from './ports';
import { activateStorage, disposeStorage, store } from './storage';
import { growthQuery } from './query';

const today: TodayContribution = {
  pluginId: 'growth',
  async collect() {
    const todayDate = dayjs().format('YYYY-MM-DD');
    const [todos, habits, focusRows] = await Promise.all([
      new TodoRepository().findByFilter(new TodoFilterDto()),
      new HabitRepository().findByFilter(new HabitFilterDto()),
      store().getRepository(TrackTime).find(),
    ]);
    const dueTodos = todos
      .filter(
        (todo) =>
          todo.status !== TodoStatus.DONE &&
          todo.status !== TodoStatus.ABANDONED &&
          dayjs(todo.planDate).format('YYYY-MM-DD') <= todayDate,
      )
      .map((todo) => ({
        id: todo.id,
        name: todo.name,
        planDate: dayjs(todo.planDate).format('YYYY-MM-DD'),
        overdue: dayjs(todo.planDate).format('YYYY-MM-DD') < todayDate,
      }));
    const todayHabits = habits
      .filter((habit) => habit.status === HabitStatus.ACTIVE && habit.cycleTodoId)
      .map((habit) => ({ id: habit.id, name: habit.name, cycleTodoId: habit.cycleTodoId }));
    const running = focusRows.find((item) => item.startAt && !item.endAt);
    const todayFocus = focusRows
      .filter((item) => item.startAt && dayjs(item.startAt).format('YYYY-MM-DD') === todayDate)
      .reduce((sum, item) => sum + (item.duration || 0), 0);
    return {
      focusSeconds: todayFocus,
      todos: dueTodos,
      habits: todayHabits,
      runningFocus: running
        ? {
            id: running.id,
            label: running.notes || '专注中',
            startedAt: running.startAt instanceof Date ? running.startAt.toISOString() : String(running.startAt),
          }
        : undefined,
    };
  },
};

export function createGrowthMain(): PluginMainContribution {
  return {
    ipcControllers: [
      { id: 'goal', routePrefix: '/goal', controller: GoalController },
      { id: 'habit', routePrefix: '/habit', controller: HabitController },
      { id: 'task', routePrefix: '/task', controller: TaskController },
      { id: 'todo', routePrefix: '/todo', controller: TodoController },
      { id: 'track-time', routePrefix: '/track-time', controller: TrackTimeController },
    ],
    ai: growthAiContribution,
    query: growthQuery,
    captureAdopters: [todoCaptureAdopter],
    today,
    async activate(ctx: PluginMainContext) {
      await activateStorage(ctx.space);
      bindActivityPort(ctx.activity);
    },
    async dispose() {
      await disposeStorage();
    },
  };
}
