import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import zhCN from '@sue/design-web-react/locale/zh_CN';
import '@sue/design-web-react/dist/sue.css';
import { AlarmClock, Goal as GoalIcon } from 'lucide-react';
import { Button, ConfigProvider, Flex, Menu, Space, Tag, message } from '@sue/design-web-react';
import { EntityDrawer, FocusTimer } from './shared/components';
import { productRef } from './product-wiki';
import { bootstrapPrototypeInspectorBridge } from '../prototype-inspector/bridge';
import { AiDecompositionDrawer } from './pages/goal/AiDecompositionDrawer';
import { GoalsPage } from './pages/goal';
import { MindMapPage } from './pages/goal/MindMapPage';
import { Workbench } from './pages/workbench';
import { TasksPage } from './pages/task';
import { TaskDetailDrawer } from './pages/task-detail';
import { TodosPage } from './pages/todo';
import { HabitsPage } from './pages/habit';
import { initialGoals, initialHabits, initialTasks, initialTodos, nav, TODAY } from './shared/mock-data';
import type {
  DrawerKind,
  DrawerState,
  FocusSession,
  Goal,
  Habit,
  SaveEntity,
  Task,
  Todo,
} from './shared/types';
import { firstOccurrenceOnOrAfter, nextOccurrence, settleRepeatingTodo } from './shared/repeat';
import './App.css';
import styles from './App.module.css';

const isPendingTodo = (todo: Todo) => todo.status !== 'done' && todo.status !== 'abandoned';

function createHabitTodo(habit: Habit, planned: string): Todo {
  return {
    id: `habit-${habit.id}-${planned}`,
    title: habit.title,
    description: `由习惯“${habit.title}”的周期执行自动生成。`,
    habitId: habit.id,
    status: 'todo',
    importance: habit.importance,
    urgency: habit.importance,
    planned,
    plannedStartTime: '09:00',
    plannedEndTime: '09:00',
    history: [`${planned} 由习惯周期生成`],
  };
}

function recordHabitResult(habit: Habit, date: string, completed: boolean): Habit {
  const logs = [...habit.logs.filter((log) => log.date !== date), { date, completed }];
  const streak = completed ? habit.streak + 1 : 0;
  return { ...habit, streak, longest: Math.max(habit.longest, streak), logs };
}

function nextHabitDate(habit: Habit, onOrAfter: string): string | undefined {
  const latestLog = [...habit.logs].sort((left, right) => left.date.localeCompare(right.date)).at(-1);
  if (!latestLog) return firstOccurrenceOnOrAfter(onOrAfter, habit.repeat);
  const next = nextOccurrence(latestLog.date, habit.repeat, habit.logs.length);
  if (!next) return undefined;
  return next >= onOrAfter ? next : firstOccurrenceOnOrAfter(onOrAfter, habit.repeat, habit.logs.length);
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState(initialGoals);
  const [tasks, setTasks] = useState(initialTasks);
  const [todos, setTodos] = useState(initialTodos);
  const [habits, setHabits] = useState(initialHabits);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [focusTimerOpen, setFocusTimerOpen] = useState(false);
  const [focusTimerTaskId, setFocusTimerTaskId] = useState<string>();
  const [focusTimerTodoId, setFocusTimerTodoId] = useState<string>();
  const [focusRelatedLocked, setFocusRelatedLocked] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('g3');
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [aiDecompositionOpen, setAiDecompositionOpen] = useState(false);
  const [taskDetailId, setTaskDetailId] = useState<string>();
  const currentNav = nav.find((item) => item.path === location.pathname)
    || nav.find((item) => location.pathname.startsWith(`${item.path}/`))
    || nav[0];

  const notify = (text: string) => message.success(text);
  const updateTodo = (id: string, patch: Partial<Todo>, event?: string) =>
    setTodos((items) =>
      items.map((todo) =>
        todo.id === id ? { ...todo, ...patch, history: event ? [...todo.history, event] : todo.history } : todo
      )
    );
  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((items) => items.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  const createTask = (task: Task) => setTasks((items) => [...items, task]);
  const deleteTask = (id: string) => setTasks((items) => items.filter((task) => task.id !== id));
  const updateGoal = (id: string, patch: Partial<Goal>) =>
    setGoals((items) => items.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)));
  const deleteGoal = (id: string) => {
    const deleted = goals.find((goal) => goal.id === id);
    const remaining = goals.filter((goal) => goal.id !== id);
    setGoals(remaining);
    setSelectedGoal(deleted?.parentId && remaining.some((goal) => goal.id === deleted.parentId) ? deleted.parentId : remaining[0]?.id || '');
    notify('目标已删除');
  };
  const openFocusTimer = useCallback((related?: { taskId?: string; todoId?: string }) => {
    setFocusTimerTaskId(related?.taskId);
    setFocusTimerTodoId(related?.todoId);
    setFocusRelatedLocked(Boolean(related?.taskId || related?.todoId));
    setFocusTimerOpen(true);
  }, []);
  const clearFocusRelated = useCallback(() => {
    setFocusTimerTaskId(undefined);
    setFocusTimerTodoId(undefined);
  }, []);
  const resolveHabitTodo = (todo: Todo, completed: boolean) => {
    const habit = habits.find((item) => item.id === todo.habitId);
    if (!habit || !isPendingTodo(todo)) return;
    const settledHabit = recordHabitResult(habit, todo.planned, completed);
    const nextDate = nextHabitDate(settledHabit, todo.planned);
    const next = nextDate ? createHabitTodo(settledHabit, nextDate) : undefined;
    const nextHabit = next ? settledHabit : { ...settledHabit, status: 'completed' as const };
    setTodos((items) => {
      if (!items.some((item) => item.id === todo.id && isPendingTodo(item))) return items;
      const settled = items.map((item): Todo =>
        item.id === todo.id
          ? { ...item, status: completed ? 'done' : 'abandoned', history: [...item.history, completed ? '完成习惯待办' : '标记习惯未完成'] }
          : item,
      );
      return next && !settled.some((item) => item.id === next.id) ? [...settled, next] : settled;
    });
    setHabits((items) => items.map((item) => (item.id === habit.id ? nextHabit : item)));
    notify(next ? (completed ? '习惯已完成，已安排下一次待办' : '已记录未完成，已安排下一次待办') : '习惯已结算，重复计划已结束');
  };
  const resolveRepeatingTodo = (todo: Todo, completed: boolean) => {
    if (!todo.repeat || !isPendingTodo(todo)) return;
    const next = settleRepeatingTodo(todo, completed);
    const snapshot: Todo = {
      ...todo,
      id: `${todo.id}-log-${todo.planned}-${todo.repeat.settledTimes}`,
      status: completed ? 'done' : 'abandoned',
      repeat: undefined,
      history: [...todo.history, completed ? `${todo.planned} 完成周期实例` : `${todo.planned} 标记周期实例未完成`],
    };
    setTodos((items) => {
      const rest = items.filter((item) => item.id !== todo.id);
      if (next.status === 'todo' && next.planned !== todo.planned) {
        return [...rest, snapshot, next];
      }
      // 系列结束：以无 repeat 的历史实例保留最终状态
      return [...rest, { ...snapshot, id: todo.id }];
    });
    notify(next.status === 'todo' && next.planned !== todo.planned ? '周期待办已结算，已安排下一次' : '周期待办已结算，重复计划已结束');
  };
  const deleteTodo = (todo: Todo) => {
    if (todo.habitId && isPendingTodo(todo)) {
      notify('习惯周期待办不能单独删除');
      return;
    }
    if (todo.repeat && isPendingTodo(todo)) {
      // 仅删除系列定义与当前视图；已物化历史（无 repeat 的结算行）保留
      setTodos((items) => items.filter((item) => item.id !== todo.id));
      notify('已删除重复待办，已完成/已放弃记录保留');
      return;
    }
    setTodos((items) => items.filter((item) => item.id !== todo.id));
    notify('待办已删除');
  };
  const completeTodo = (todo: Todo) => {
    if (todo.habitId) return resolveHabitTodo(todo, true);
    if (todo.repeat) return resolveRepeatingTodo(todo, true);
    updateTodo(todo.id, { status: 'done' }, '完成待办');
    notify('待办已完成');
  };
  const markTodoIncomplete = (todo: Todo) => {
    if (todo.habitId) return resolveHabitTodo(todo, false);
    if (todo.repeat) return resolveRepeatingTodo(todo, false);
    updateTodo(todo.id, { status: 'abandoned' }, '标记未完成');
    notify('待办已标记为未完成');
  };
  const abandonTodo = (todo: Todo) => {
    if (todo.habitId) return resolveHabitTodo(todo, false);
    if (todo.repeat) return resolveRepeatingTodo(todo, false);
    updateTodo(todo.id, { status: 'abandoned' }, '放弃待办');
    notify('待办已放弃');
  };
  const saveEntity: SaveEntity = (kind: DrawerKind, draft: Goal | Task | Todo | Habit) => {
    if (kind === 'goal')
      setGoals((items) => {
        const exists = items.some((item) => item.id === draft.id);
        return exists
          ? items.map((item) => (item.id === draft.id ? (draft as Goal) : item))
          : [...items, draft as Goal];
      });
    if (kind === 'task')
      setTasks((items) => {
        const exists = items.some((item) => item.id === draft.id);
        return exists
          ? items.map((item) => (item.id === draft.id ? (draft as Task) : item))
          : [...items, { ...(draft as Task), status: 'todo' }];
      });
    if (kind === 'habit')
      setHabits((items) => {
        const exists = items.some((item) => item.id === draft.id);
        return exists
          ? items.map((item) => (item.id === draft.id ? (draft as Habit) : item))
          : [...items, draft as Habit];
      });
    if (kind === 'todo') {
      const todo = draft as Todo;
      const exists = todos.some((item) => item.id === todo.id);
      setTodos((items) =>
        exists
          ? items.map((item) =>
              item.id === todo.id ? { ...todo, history: [...item.history, '更新待办信息'] } : item
            )
          : [...items, { ...todo, status: 'todo' }]
      );
    }
    setDrawer(null);
    notify('已保存并同步相关视图');
  };
  useEffect(() => {
    const candidates = habits
      .filter((habit) => habit.status === 'active')
      .filter((habit) => !todos.some((todo) => todo.habitId === habit.id && isPendingTodo(todo)));
    const missing = candidates.flatMap((habit) => {
      const planned = nextHabitDate(habit, TODAY);
      return planned ? [createHabitTodo(habit, planned)] : [];
    });
    const completedHabitIds = new Set(
      candidates.filter((habit) => !nextHabitDate(habit, TODAY)).map((habit) => habit.id)
    );
    if (completedHabitIds.size) {
      setHabits((items) =>
        items.map((habit) => (completedHabitIds.has(habit.id) ? { ...habit, status: 'completed' } : habit))
      );
    }
    if (!missing.length) return;
    setTodos((items) => [...items, ...missing.filter((todo) => !items.some((item) => item.id === todo.id))]);
  }, [habits, todos]);

  useEffect(() => {
    const habitById = new Map(habits.map((habit) => [habit.id, habit]));
    const overdue = todos.filter((todo) => {
      const habit = todo.habitId ? habitById.get(todo.habitId) : undefined;
      return habit?.status === 'active' && isPendingTodo(todo) && todo.planned < TODAY;
    });
    if (!overdue.length) return;
    setTodos((items) =>
      items.flatMap((todo) => {
        const habit = todo.habitId ? habitById.get(todo.habitId) : undefined;
        if (!habit || !overdue.some((item) => item.id === todo.id)) return [todo];
        const settledHabit = recordHabitResult(habit, todo.planned, false);
        const nextDate = nextHabitDate(settledHabit, TODAY);
        return [
          { ...todo, status: 'abandoned', history: [...todo.history, '逾期未确认，自动记为未完成'] },
          ...(nextDate ? [createHabitTodo(settledHabit, nextDate)] : []),
        ];
      }),
    );
    setHabits((items) =>
      items.map((habit) =>
        overdue
          .filter((todo) => todo.habitId === habit.id)
          .reduce((nextHabit, todo) => {
            const settledHabit = recordHabitResult(nextHabit, todo.planned, false);
            return nextHabitDate(settledHabit, TODAY)
              ? settledHabit
              : { ...settledHabit, status: 'completed' as const };
          }, habit),
      ),
    );
  }, [habits, todos]);

  useEffect(() => {
    const overdue = todos.filter((todo) => todo.repeat && isPendingTodo(todo) && todo.planned < TODAY);
    if (!overdue.length) return;
    setTodos((items) =>
      items.map((todo) =>
        overdue.some((item) => item.id === todo.id) ? settleRepeatingTodo(todo, false, TODAY) : todo
      )
    );
  }, [todos]);

  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff', controlHeight: 32, borderRadius: 6 } }}>
      <Flex className={styles.appShell} container="full">
        <Flex vertical className={styles.sidebar} container="fixed" data-product-ref={productRef('global.overview')}>
          <Flex className={styles.brand} align="center" gap={10}>
            <span>
              <GoalIcon size={17} />
            </span>
            知止
          </Flex>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[currentNav.path]}
            items={nav.map((item) => {
              const Icon = item.icon;
              return { key: item.path, icon: <Icon size={16} />, label: item.label };
            })}
            onClick={({ key }) => navigate(key)}
          />
          <div className={styles.sidebarFoot}>
            <Tag color="blue">Growth Prototype</Tag>
            <p>仅保存在当前会话</p>
          </div>
        </Flex>
        <Flex vertical className={styles.workspace} container="fill">
          <Flex className={styles.topbar} container="fixed" align="center" justify="space-between">
            <div>
              <span className={styles.crumb}>
                个人成长 / <b>{currentNav.label}</b>
              </span>
            </div>
            <Space>
              <Button type="text" icon={<AlarmClock size={16} />} aria-label="打开专注计时" onClick={() => openFocusTimer()} />
            </Space>
          </Flex>
          <main className={styles.content}>
            <Routes>
              <Route
                path="/workbench"
                element={
                  <Workbench
                    goals={goals}
                    tasks={tasks}
                    todos={todos}
                    habits={habits}
                    onNavigate={navigate}
                    completeTodo={completeTodo}
                    markTodoIncomplete={markTodoIncomplete}
                  />
                }
              />
              <Route
                path="/goals"
                element={
                  <GoalsPage
                    goals={goals}
                    tasks={tasks}
                    todos={todos}
                    habits={habits}
                    selectedGoal={selectedGoal}
                    setSelectedGoal={setSelectedGoal}
                    setDrawer={setDrawer}
                    updateGoal={updateGoal}
                    deleteGoal={deleteGoal}
                    onOpenTaskDetail={setTaskDetailId}
                    onOpenAiDecomposition={() => setAiDecompositionOpen(true)}
                  />
                }
              />
              <Route
                path="/goals/mindmap"
                element={<MindMapPage goals={goals} tasks={tasks} />}
              />
              <Route
                path="/tasks"
                element={
                  <TasksPage
                    tasks={tasks}
                    goals={goals}
                    setDrawer={setDrawer}
                    updateTask={updateTask}
                    onFocusTask={(task) => openFocusTimer({ taskId: task.id })}
                    onOpenTaskDetail={setTaskDetailId}
                  />
                }
              />
              <Route
                path="/todos"
                element={
                  <TodosPage
                    todos={todos}
                    goals={goals}
                    tasks={tasks}
                    habits={habits}
                    setDrawer={setDrawer}
                    completeTodo={completeTodo}
                    markTodoIncomplete={markTodoIncomplete}
                    abandonTodo={abandonTodo}
                    deleteTodo={deleteTodo}
                    onFocusTodo={(todo) => openFocusTimer({ todoId: todo.id })}
                  />
                }
              />
              <Route
                path="/habits"
                element={<HabitsPage habits={habits} goals={goals} todos={todos} setDrawer={setDrawer} completeTodo={completeTodo} markTodoIncomplete={markTodoIncomplete} />}
              />
              <Route path="*" element={<Navigate to={nav[0].path} replace />} />
            </Routes>
          </main>
        </Flex>
      </Flex>
      {taskDetailId && <TaskDetailDrawer taskId={taskDetailId} goals={goals} tasks={tasks} todos={todos} updateTask={updateTask} createTask={createTask} deleteTask={deleteTask} setDrawer={setDrawer} onFocusTask={(task) => openFocusTimer({ taskId: task.id })} onClose={() => setTaskDetailId(undefined)} notify={notify} />}
      {drawer && (
        <EntityDrawer
          drawer={drawer}
          goals={goals}
          tasks={tasks}
          todos={todos}
          habits={habits}
          sessions={sessions}
          onClose={() => setDrawer(null)}
          onSave={saveEntity}
          onFocusTask={(task) => openFocusTimer({ taskId: task.id })}
          onFocusTodo={(todo) => openFocusTimer({ todoId: todo.id })}
        />
      )}
      <AiDecompositionDrawer
        open={aiDecompositionOpen}
        goalId={selectedGoal}
        goals={goals}
        tasks={tasks}
        todos={todos}
        habits={habits}
        setDrawer={setDrawer}
        saveEntity={saveEntity}
        onClose={() => setAiDecompositionOpen(false)}
      />
      <FocusTimer
        open={focusTimerOpen}
        relatedLocked={focusRelatedLocked}
        initialTaskId={focusTimerTaskId}
        initialTodoId={focusTimerTodoId}
        tasks={tasks}
        todos={todos}
        sessions={sessions}
        onClose={() => {
          setFocusTimerOpen(false);
          setFocusRelatedLocked(false);
        }}
        onRelatedSelected={clearFocusRelated}
        setSessions={setSessions}
        updateTask={updateTask}
      />
    </ConfigProvider>
  );
}

const inspectorBridge = bootstrapPrototypeInspectorBridge();
if (import.meta.hot) import.meta.hot.dispose(inspectorBridge.destroy);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
