'use client';

import { useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Progress, Tag, Spin } from '@arco-design/web-react';
import { TodoProvider, useTodoContext } from './context';
import { TodoChart } from './TodoChart';
import { TodoPriorityMatrix } from './TodoPriorityMatrix';
import { RecentTodos } from './RecentTodos';

export default function TodoDashboardPage() {
  return (
    <TodoProvider>
      <TodoDashboardContent />
    </TodoProvider>
  );
}

function TodoDashboardContent() {
  const { todoList, loading } = useTodoContext();

  // 统计数据
  const stats = useMemo(() => {
    const total = todoList.length;
    const completed = todoList.filter((todo) => todo.status === 'done').length;
    const pending = todoList.filter((todo) => todo.status === 'todo').length;
    const abandoned = todoList.filter(
      (todo) => todo.status === 'abandoned',
    ).length;

    // 优先级统计
    const highPriority = todoList.filter(
      (todo) =>
        todo.importance === 1 && todo.urgency === 1 && todo.status === 'todo',
    ).length;
    const mediumPriority = todoList.filter(
      (todo) =>
        ((todo.importance === 1 && todo.urgency === 2) ||
          (todo.importance === 2 && todo.urgency === 1)) &&
        todo.status === 'todo',
    ).length;

    // 今日完成
    const today = new Date();
    const todayCompleted = todoList.filter((todo) => {
      if (todo.status !== 'done' || !todo.doneAt) return false;
      const doneDate = new Date(todo.doneAt);
      return doneDate >= startOfDay(today) && doneDate <= endOfDay(today);
    }).length;

    // 本周完成
    const weekStart = subDays(today, 7);
    const weekCompleted = todoList.filter((todo) => {
      if (todo.status !== 'done' || !todo.doneAt) return false;
      const doneDate = new Date(todo.doneAt);
      return doneDate >= weekStart;
    }).length;

    // 完成率
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // 逾期任务
    const overdue = todoList.filter((todo) => {
      if (todo.status !== 'todo') return false;
      const planDate = new Date(todo.planDate);
      return planDate < startOfDay(today);
    }).length;

    return {
      total,
      completed,
      pending,
      abandoned,
      highPriority,
      mediumPriority,
      todayCompleted,
      weekCompleted,
      completionRate,
      overdue,
    };
  }, [todoList]);

  // 图表数据
  const chartData = useMemo(() => {
    const data: { date: string; completed: number; created: number }[] = [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });

    last7Days.forEach((dateStr) => {
      const completed = todoList.filter((todo) => {
        if (todo.status !== 'done' || !todo.doneAt) return false;
        return format(new Date(todo.doneAt), 'yyyy-MM-dd') === dateStr;
      }).length;

      const created = todoList.filter((todo) => {
        return format(new Date(todo.createdAt), 'yyyy-MM-dd') === dateStr;
      }).length;

      data.push({
        date: format(new Date(dateStr), 'MM/dd'),
        completed,
        created,
      });
    });

    return data;
  }, [todoList]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg-1 h-full">
      <div className="space-y-6">
        {/* 核心统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 总任务数 */}
          <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-light-1 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded"></div>
              </div>
              <Tag color="blue" size="small">
                全部
              </Tag>
            </div>
            <div className="text-3xl font-bold text-text-1 mb-1">
              {stats.total}
            </div>
            <div className="text-sm text-text-3">总任务数</div>
          </div>

          {/* 已完成 */}
          <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success-light-1 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-success rounded"></div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-3 mb-1">
                  {stats.completionRate}%
                </div>
                <Progress
                  percent={stats.completionRate}
                  showText={false}
                  style={{ width: '64px' }}
                />
              </div>
            </div>
            <div className="text-3xl font-bold text-success mb-1">
              {stats.completed}
            </div>
            <div className="text-sm text-text-3">已完成</div>
          </div>

          {/* 待处理 */}
          <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-light-1 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-warning rounded"></div>
              </div>
              {stats.overdue > 0 && (
                <Tag color="red" size="small">
                  {stats.overdue} 逾期
                </Tag>
              )}
            </div>
            <div className="text-3xl font-bold text-warning mb-1">
              {stats.pending}
            </div>
            <div className="text-sm text-text-3">待处理</div>
          </div>

          {/* 高优先级 */}
          <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-danger-light-1 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-danger rounded"></div>
              </div>
              <Tag color="red" size="small">
                紧急重要
              </Tag>
            </div>
            <div className="text-3xl font-bold text-danger mb-1">
              {stats.highPriority}
            </div>
            <div className="text-sm text-text-3">高优先级</div>
          </div>
        </div>

        {/* 今日和本周统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-light-1 rounded-lg flex items-center justify-center mr-3">
                <div className="w-5 h-5 bg-primary rounded"></div>
              </div>
              <div>
                <div className="font-semibold text-text-1">今日完成</div>
                <div className="text-sm text-text-3">Today's Achievement</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {stats.todayCompleted}{' '}
              <span className="text-base font-normal text-text-3">个任务</span>
            </div>
          </div>

          <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-link-light-1 rounded-lg flex items-center justify-center mr-3">
                <div className="w-5 h-5 bg-link rounded"></div>
              </div>
              <div>
                <div className="font-semibold text-text-1">本周完成</div>
                <div className="text-sm text-text-3">Weekly Achievement</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-link">
              {stats.weekCompleted}{' '}
              <span className="text-base font-normal text-text-3">个任务</span>
            </div>
          </div>
        </div>

        {/* 图表和矩阵 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodoChart data={chartData} loading={loading} />
          </div>
          <div>
            <TodoPriorityMatrix todoList={todoList} />
          </div>
        </div>

        {/* 最近任务 */}
        <RecentTodos todoList={todoList} />
      </div>
    </div>
  );
}
