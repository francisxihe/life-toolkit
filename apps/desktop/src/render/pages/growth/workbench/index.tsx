import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Flex, Row, Spin, Statistic, message } from '@sue/design-web-react';
import { CheckCircleOutlined, ClockCircleOutlined, FireOutlined, FlagOutlined, RightOutlined } from '@ant-design/icons';
import { GoalStatus, HabitStatus, TaskStatus, TodoRelatedType, TodoStatus } from '@true-north/enum';
import { GoalService, HabitService, TaskService, TodoService, TrackTimeController } from '@true-north/web-service';
import { HabitVo, TaskWithoutRelationsVo, TodoVo } from '@true-north/vo';
import { useNavigate } from 'react-router-dom';
import { ProductSurface, productRef } from '@true-north/product-wiki';
import dayjs from 'dayjs';
import { onHabitChanged, onTaskChanged, onTodoChanged } from '../events';
import { formatHabitRepeatLabel } from '../habit/formatHabitRepeatLabel';
import styles from './style.module.less';

type DashboardData = {
  goals: any[];
  tasks: TaskWithoutRelationsVo[];
  todos: TodoVo[];
  habits: HabitVo[];
  focusSeconds: number;
};

const emptyData: DashboardData = { goals: [], tasks: [], todos: [], habits: [], focusSeconds: 0 };

export default function Workbench() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>(emptyData);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalResult, taskResult, todoResult, habitResult, trackTimeResult] = await Promise.all([
        GoalService.findByFilter({}),
        TaskService.findByFilter({}),
        TodoService.list(),
        HabitService.findByFilter({}),
        TrackTimeController.list(),
      ]);
      setData({
        goals: goalResult?.list || [],
        tasks: taskResult?.list || [],
        todos: todoResult?.list || [],
        habits: habitResult?.list || [],
        focusSeconds: (trackTimeResult?.list || []).reduce((total, record) => total + (record.duration || 0), 0),
      });
    } catch (error) {
      console.error('加载工作台失败:', error);
      message.error('加载工作台失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const unsubscribeTask = onTaskChanged(() => { void loadData(); });
    const unsubscribeTodo = onTodoChanged(() => { void loadData(); });
    const unsubscribeHabit = onHabitChanged(() => { void loadData(); });
    return () => {
      unsubscribeTask();
      unsubscribeTodo();
      unsubscribeHabit();
    };
  }, [loadData]);

  const dueTodos = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return data.todos
      .filter((todo) => todo.status !== TodoStatus.DONE && todo.status !== TodoStatus.ABANDONED && formatDate(todo.planDate) <= today)
      .sort((left, right) => formatDate(left.planDate).localeCompare(formatDate(right.planDate)));
  }, [data.todos]);

  const taskStats = useMemo(() => {
    const total = data.tasks.length;
    const done = data.tasks.filter((task) => task.status === TaskStatus.DONE).length;
    const doing = data.tasks.filter((task) => task.status === TaskStatus.DOING).length;
    const overdue = data.tasks.filter((task) =>
      (task.status === TaskStatus.TODO || task.status === TaskStatus.DOING) &&
      task.endAt &&
      dayjs(task.endAt).isBefore(dayjs(), 'day'),
    ).length;
    return { total, doing, overdue, completionRate: total ? Math.round(done / total * 100) : 0 };
  }, [data.tasks]);

  const todoStats = useMemo(() => {
    const total = data.todos.length;
    const completed = data.todos.filter((todo) => todo.status === TodoStatus.DONE).length;
    const pending = data.todos.filter((todo) => todo.status === TodoStatus.TODO).length;
    const overdue = data.todos.filter((todo) =>
      todo.status === TodoStatus.TODO && dayjs(todo.planDate).isBefore(dayjs(), 'day'),
    ).length;
    return { total, pending, overdue, completionRate: total ? Math.round(completed / total * 100) : 0 };
  }, [data.todos]);

  const habitStats = useMemo(() => {
    const total = data.habits.length;
    const active = data.habits.filter((habit) => habit.status === HabitStatus.ACTIVE).length;
    const completed = data.habits.filter((habit) => habit.status === HabitStatus.COMPLETED).length;
    const averageCompletion = total
      ? Math.round(data.habits.reduce((sum, habit) => {
        const completedCount = habit.completedCount || 0;
        const currentStreak = habit.currentStreak || 0;
        const completionRate = completedCount && currentStreak
          ? Math.round(completedCount / (currentStreak + completedCount) * 100)
          : 0;
        return sum + completionRate;
      }, 0) / total)
      : 0;
    return { total, active, completed, averageCompletion };
  }, [data.habits]);

  const handleCompleteTodo = async (todo: TodoVo) => {
    try {
      await TodoService.done(todo.relatedType || TodoRelatedType.NONE, todo.id);
      await loadData();
    } catch (error) {
      console.error('完成待办失败:', error);
      message.error('完成待办失败');
    }
  };

  const handleHabitComplete = async (habit: HabitVo) => {
    if (!habit.cycleTodoId) {
      message.warning('当前没有可结算的习惯待办');
      return;
    }
    try {
      await TodoService.done(TodoRelatedType.HABIT, habit.cycleTodoId);
      message.success('习惯本次打卡已完成');
      await loadData();
    } catch (error) {
      console.error('完成习惯失败:', error);
      message.error('完成习惯失败');
    }
  };

  const handleHabitIncomplete = async (habit: HabitVo) => {
    if (!habit.cycleTodoId) {
      message.warning('当前没有可结算的习惯待办');
      return;
    }
    try {
      await TodoService.abandon(TodoRelatedType.HABIT, habit.cycleTodoId);
      message.success('已记录未完成');
      await loadData();
    } catch (error) {
      console.error('标记习惯未完成失败:', error);
      message.error('标记习惯未完成失败');
    }
  };

  const activeGoals = data.goals.filter((goal) => goal.status === GoalStatus.DOING).length;
  const longestStreak = Math.max(0, ...data.habits.map((habit) => habit.currentStreak || 0));

  return (
    <ProductSurface id={productRef('global.rules')}>
    <Flex vertical container="full" className={styles.page} gap={20}>
      <Flex container="fixed" align="center" justify="space-between" className={styles.header}>
        <div><h1>工作台</h1><p>聚合今天最需要推进的行动和投入。</p></div>
        <Button onClick={() => void loadData()}>刷新</Button>
      </Flex>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}><Metric title="活跃目标" value={activeGoals} icon={<FlagOutlined />} /></Col>
          <Col xs={24} sm={12} xl={6}><Metric title="今日待办" value={dueTodos.length} icon={<CheckCircleOutlined />} /></Col>
          <Col xs={24} sm={12} xl={6}><Metric title="专注投入" value={formatHours(data.focusSeconds)} icon={<ClockCircleOutlined />} /></Col>
          <Col xs={24} sm={12} xl={6}><Metric title="习惯连续" value={longestStreak} suffix="天" icon={<FireOutlined />} /></Col>
        </Row>
        <Flex vertical gap={12} className={styles.statistics}>
          <h2>执行概览</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={8}><StatisticsGroup title="任务" items={[
              { title: '总数', value: taskStats.total, suffix: '项' },
              { title: '完成率', value: taskStats.completionRate, suffix: '%' },
              { title: '进行中', value: taskStats.doing, suffix: '项' },
              { title: '逾期', value: taskStats.overdue, suffix: '项', tone: 'danger' },
            ]} /></Col>
            <Col xs={24} xl={8}><StatisticsGroup title="待办" items={[
              { title: '总数', value: todoStats.total, suffix: '项' },
              { title: '完成率', value: todoStats.completionRate, suffix: '%' },
              { title: '待处理', value: todoStats.pending, suffix: '项' },
              { title: '逾期', value: todoStats.overdue, suffix: '项', tone: 'danger' },
            ]} /></Col>
            <Col xs={24} xl={8}><StatisticsGroup title="习惯" items={[
              { title: '总数', value: habitStats.total, suffix: '个' },
              { title: '活跃', value: habitStats.active, suffix: '个', tone: 'success' },
              { title: '已完成', value: habitStats.completed, suffix: '个' },
              { title: '平均完成率', value: habitStats.averageCompletion, suffix: '%' },
            ]} /></Col>
          </Row>
        </Flex>
        <Row gutter={[16, 16]} className={styles.contentRow}>
          <Col xs={24} xl={14}>
            <Card title="今日待办" extra={<Button type="link" onClick={() => navigate('/growth/todo/todo-today')}>查看全部</Button>}>
              <Flex vertical className={styles.list} gap={4}>
                {dueTodos.length ? dueTodos.slice(0, 8).map((todo) => (
                  <Flex key={todo.id} align="center" justify="space-between" gap={12} className={styles.listRow}>
                    <Flex align="center" gap={10} className={styles.todoTitle}>
                      <Button type="text" shape="circle" icon={<CheckCircleOutlined />} aria-label={`完成 ${todo.name}`} onClick={() => void handleCompleteTodo(todo)} />
                      <div><b>{todo.name}</b><span>{formatDate(todo.planDate)}</span></div>
                    </Flex>
                    <Button type="text" icon={<RightOutlined />} aria-label={`查看 ${todo.name}`} onClick={() => navigate('/growth/todo/todo-all')} />
                  </Flex>
                )) : (
                  <Flex align="center" className={styles.empty}>
                    今天没有待处理的待办。
                  </Flex>
                )}
              </Flex>
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card title="习惯打卡" extra={<Button type="link" onClick={() => navigate('/growth/habit/habit-list')}>查看习惯</Button>}>
              <Flex vertical className={styles.list} gap={4}>
                {data.habits.length ? data.habits.slice(0, 6).map((habit) => (
                  <Flex key={habit.id} align="center" justify="space-between" gap={12} className={styles.listRow}>
                    <Flex align="center" gap={10} className={styles.todoTitle}>
                      <FireOutlined className={styles.habitIcon} />
                      <div>
                        <b>{habit.name}</b>
                        <span>
                          {formatHabitRepeatLabel(habit)} · 连续 {habit.currentStreak || 0} 天 ·{' '}
                          {habit.goals?.[0]?.name || '—'}
                        </span>
                      </div>
                    </Flex>
                    <HabitCheckInActions
                      habit={habit}
                      onComplete={() => void handleHabitComplete(habit)}
                      onIncomplete={() => void handleHabitIncomplete(habit)}
                      onOpenDetail={() => navigate(`/growth/habit/habit-detail/${habit.id}`)}
                    />
                  </Flex>
                )) : (
                  <Flex align="center" className={styles.empty}>
                    还没有进行中的习惯。
                  </Flex>
                )}
              </Flex>
            </Card>
          </Col>
        </Row>
      </Spin>
    </Flex>
    </ProductSurface>
  );
}

function HabitCheckInActions({
  habit,
  onComplete,
  onIncomplete,
  onOpenDetail,
}: {
  habit: HabitVo;
  onComplete: () => void;
  onIncomplete: () => void;
  onOpenDetail: () => void;
}) {
  if (habit.status === HabitStatus.COMPLETED) return <span className={styles.habitStatus}>执行规则已结束</span>;
  if (habit.status === HabitStatus.PAUSED) return <span className={styles.habitStatus}>已暂停打卡</span>;
  if (habit.status === HabitStatus.ABANDONED) return <span className={styles.habitStatus}>已放弃习惯</span>;
  if (!habit.cycleTodoId) {
    return (
      <Flex gap={6} align="center">
        <span className={styles.habitStatus}>下一次待办已安排</span>
        <Button type="text" icon={<RightOutlined />} aria-label={`查看 ${habit.name}`} onClick={onOpenDetail} />
      </Flex>
    );
  }
  return (
    <Flex gap={6} align="center">
      <Button size="small" type="primary" onClick={onComplete}>完成</Button>
      <Button size="small" onClick={onIncomplete}>未完成</Button>
    </Flex>
  );
}

function Metric({ title, value, suffix, icon }: { title: string; value: string | number; suffix?: string; icon: React.ReactNode }) {
  return <Card className={styles.metric}><Flex align="center" justify="space-between"><Statistic title={title} value={value} suffix={suffix} /><span className={styles.metricIcon}>{icon}</span></Flex></Card>;
}

type StatisticItem = { title: string; value: number; suffix: string; tone?: 'danger' | 'success' };

function StatisticsGroup({ title, items }: { title: string; items: StatisticItem[] }) {
  return (
    <Card title={title} className={styles.statisticsGroup}>
      <Row gutter={[12, 16]}>
        {items.map((item) => (
          <Col key={item.title} span={12}>
            <Statistic title={item.title} value={item.value} suffix={item.suffix} className={item.tone ? styles[item.tone] : undefined} />
          </Col>
        ))}
      </Row>
    </Card>
  );
}

function formatDate(value?: string | Date) {
  if (!value) return '';
  return dayjs(value).format('YYYY-MM-DD');
}

function formatHours(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}
